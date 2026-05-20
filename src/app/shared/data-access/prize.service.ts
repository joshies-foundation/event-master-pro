import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { resizeImage } from '../util/image-helpers';
import { Database } from '../util/schema';
import {
  Function,
  realtimeUpdatesFromTable,
  showMessageOnError,
  StorageBucket,
  Table,
} from '../util/supabase-helpers';
import { PlayerModel, PrizeModel, SessionModel } from '../util/supabase-types';
import { GameStateService } from './game-state.service';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root',
})
export class PrizeService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);

  readonly prizes$: Observable<PrizeModel[]> =
    this.gameStateService.sessionId$.pipe(
      switchMap((sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Prize,
          `session_id=eq.${sessionId}`,
        ).pipe(
          map((prizes) =>
            [...prizes].sort((a, b) => {
              if (a.won_at && b.won_at) return b.won_at.localeCompare(a.won_at);
              if (a.won_at) return -1;
              if (b.won_at) return 1;
              return a.id - b.id;
            }),
          ),
        ),
      ),
      shareReplay(1),
    );

  readonly prizes: Signal<PrizeModel[] | undefined> = toSignal(this.prizes$);

  readonly unwonPrizes: Signal<PrizeModel[] | undefined> = computed(() =>
    this.prizes()?.filter((p) => p.won_by_player_id === null),
  );

  readonly poolIsEmpty: Signal<boolean> = computed(
    () => (this.unwonPrizes()?.length ?? 0) === 0,
  );

  readonly userPrizes: Signal<PrizeModel[] | undefined> = computed(() => {
    const userPlayerId = this.playerService.userPlayerId();
    if (userPlayerId === null || userPlayerId === undefined) return [];
    return this.prizes()?.filter((p) => p.won_by_player_id === userPlayerId);
  });

  readonly userPrizeTokens: Signal<number> = computed(
    () => this.playerService.userPlayer()?.prize_tokens ?? 0,
  );

  readonly userHasPrizesOrTokens: Signal<boolean> = computed(
    () => this.userPrizeTokens() > 0 || (this.userPrizes()?.length ?? 0) > 0,
  );

  async uploadPrize(
    sessionId: SessionModel['id'],
    image: File,
  ): Promise<PostgrestSingleResponse<PrizeModel> | null> {
    const resizedImage = await resizeImage(image, 800);
    const uploadPath = `${sessionId}/${Date.now()}-${Math.floor(Math.random() * 1e9)}.webp`;

    const { data: uploadData, error: uploadError } = await showMessageOnError(
      this.supabase.storage
        .from(StorageBucket.PrizeImages)
        .upload(uploadPath, resizedImage, { contentType: 'image/webp' }),
      this.messageService,
    );

    if (uploadError) return null;

    const imageUrl = this.supabase.storage
      .from(StorageBucket.PrizeImages)
      .getPublicUrl(uploadData.path).data.publicUrl;

    return this.supabase
      .from(Table.Prize)
      .insert({ session_id: sessionId, image_url: imageUrl })
      .select()
      .single();
  }

  async deletePrize(
    prize: Pick<PrizeModel, 'id' | 'image_url' | 'won_by_player_id'>,
  ): Promise<PostgrestSingleResponse<null>> {
    if (prize.won_by_player_id !== null) {
      throw new Error('Cannot delete a won prize');
    }

    const storagePath = extractStoragePath(prize.image_url);
    if (storagePath) {
      await this.supabase.storage
        .from(StorageBucket.PrizeImages)
        .remove([storagePath]);
    }

    return this.supabase.from(Table.Prize).delete().eq('id', prize.id);
  }

  async setPlayerTokens(
    playerId: PlayerModel['id'],
    newCount: number,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Player)
      .update({ prize_tokens: Math.max(0, newCount) })
      .eq('id', playerId);
  }

  async setAutoMint(
    sessionId: SessionModel['id'],
    enabled: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Session)
      .update({ prize_token_on_event_win: enabled })
      .eq('id', sessionId);
  }

  async spinMachine(
    playerId: PlayerModel['id'],
  ): Promise<PostgrestSingleResponse<PrizeModel>> {
    return this.supabase.rpc(Function.SpinPrizeMachine, {
      _player_id: playerId,
    });
  }
}

function extractStoragePath(publicUrl: string): string | null {
  // Public storage URLs look like:
  // https://<project>.supabase.co/storage/v1/object/public/prize-images/<sessionId>/<filename>.webp
  const marker = `/${StorageBucket.PrizeImages}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
