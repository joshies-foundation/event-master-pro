import { inject, Injectable, Signal } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  Table,
  Function,
} from '../util/supabase-helpers';
import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { SessionService } from './session.service';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import {
  defined,
  distinctUntilIdChanged,
  whenAllValuesNotNull,
  whenNotNull,
} from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/data-access/auth.service';
import { PlayerModel, UserModel } from '../util/supabase-types';
import { Database } from '../util/schema';
import { GameStateService } from './game-state.service';
import { addRankingInfoToPlayers } from '../util/ranking-helpers';

export interface PlayerWithUserInfo {
  player_id: number;
  user_id: string;
  score: number;
  enabled: boolean;
  display_name: string;
  avatar_url: string;
  can_edit_profile: boolean;
}

export interface PlayerWithUserAndRankInfo extends PlayerWithUserInfo {
  rank: number;
  rankEmoji: string | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly gameStateService = inject(GameStateService);

  readonly playersWithoutDisplayNames$: Observable<PlayerModel[] | null> =
    this.sessionService.session$.pipe(
      distinctUntilIdChanged(),
      whenNotNull((session) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.Player,
          `session_id=eq.${session.id}`,
        ),
      ),
      shareReplay(1),
    );

  private readonly playerUsers$: Observable<UserModel[] | null> =
    this.playersWithoutDisplayNames$.pipe(
      distinctUntilChanged(
        (a, b) =>
          (a === null && b === null) ||
          (a !== null && a.every((val, idx) => val === b?.[idx])),
      ),
      whenNotNull((players) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.User,
          `id=in.(${players.map((player) => player.user_id)})`,
        ),
      ),
      shareReplay(1),
    );

  readonly playersIncludingDisabled$: Observable<PlayerWithUserInfo[] | null> =
    this.playerUsers$.pipe(
      withLatestFrom(this.playersWithoutDisplayNames$),
      map(([users, players]) => ({ players, users })),
      whenAllValuesNotNull(({ players, users }) =>
        of(
          players
            .map((player) => {
              const user = users.find((user) => user.id === player.user_id)!;
              return {
                player_id: player.id,
                user_id: user.id,
                score: player.score,
                enabled: player.enabled,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                can_edit_profile: user.can_edit_profile,
              };
            })
            .sort((a, b) => b.score - a.score),
        ),
      ),
      shareReplay(1),
    );

  readonly playersIncludingDisabled: Signal<
    PlayerWithUserInfo[] | null | undefined
  > = toSignal(this.playersIncludingDisabled$);

  readonly players$: Observable<PlayerWithUserAndRankInfo[] | null> =
    this.playersIncludingDisabled$.pipe(
      whenNotNull((players) => of(addRankingInfoToPlayers(players, true))),
      shareReplay(1),
    );

  readonly players: Signal<PlayerWithUserAndRankInfo[] | null | undefined> =
    toSignal(this.players$);

  readonly userPlayer$: Observable<PlayerWithUserInfo | null> =
    this.authService.user$.pipe(
      defined(),
      switchMap((authUser) =>
        this.playersIncludingDisabled$.pipe(
          whenNotNull((players) =>
            of(
              players.find((player) => player.user_id === authUser.id) ?? null,
            ),
          ),
        ),
      ),
      shareReplay(1),
    );

  readonly userPlayer: Signal<PlayerWithUserInfo | null | undefined> = toSignal(
    this.userPlayer$,
  );

  readonly userPlayerId$: Observable<number | null> = this.userPlayer$.pipe(
    map((userPlayer) => userPlayer?.player_id ?? null),
    shareReplay(1),
  );

  readonly userIsGameMaster$: Observable<boolean> = combineLatest({
    user: this.authService.user$,
    gameMasterUserId: this.gameStateService.gameMasterUserId$,
  }).pipe(
    map(({ user, gameMasterUserId }) => user?.id === gameMasterUserId),
    shareReplay(1),
  );

  readonly userIsGameMaster: Signal<boolean | undefined> = toSignal(
    this.userIsGameMaster$,
  );

  async overridePointsAdd(
    playerId: number,
    numPointsToAdd: number,
    comment: string,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.OverridePoints, {
      data: { playerId, change: numPointsToAdd, comment, replace: false },
    });
  }

  async overridePointsReplace(
    playerId: number,
    newScore: number,
    comment: string,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.OverridePoints, {
      data: { playerId, change: newScore, comment, replace: true },
    });
  }

  async setEnabled(
    playerId: number,
    enabled: boolean,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.Player)
      .update({ enabled })
      .eq('id', playerId);
  }
}
