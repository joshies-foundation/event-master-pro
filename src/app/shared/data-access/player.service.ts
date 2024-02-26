import { inject, Injectable } from '@angular/core';
import {
  realtimeUpdatesFromTable,
  showMessageOnError,
  Table,
} from '../util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { SessionService } from './session.service';
import { MessageService } from 'primeng/api';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  defined,
  distinctUntilIdChanged,
  whenAllValuesNotNull,
  whenNotNull,
} from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly supabase = inject(SupabaseClient);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);

  readonly playersWithoutDisplayNames$ = this.sessionService.session$.pipe(
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

  private readonly playerUsers$ = this.playersWithoutDisplayNames$.pipe(
    distinctUntilChanged(
      (previous, current) => previous?.length === current?.length,
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

  readonly playersIncludingDisabled$ = combineLatest({
    players: this.playersWithoutDisplayNames$,
    users: this.playerUsers$,
  }).pipe(
    whenAllValuesNotNull(({ players, users }) =>
      of(
        players.map((player) => {
          const user = users.find((user) => user.id === player.user_id)!;
          return {
            player_id: player.id,
            user_id: user.id,
            score: player.score,
            enabled: player.enabled,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
          };
        }),
      ),
    ),
    shareReplay(1),
  );

  readonly playersIncludingDisabled = toSignal(this.playersIncludingDisabled$);

  readonly players$ = this.playersIncludingDisabled$.pipe(
    whenNotNull((players) => of(players.filter((player) => player.enabled))),
    shareReplay(1),
  );

  readonly players = toSignal(this.players$);

  readonly userPlayer$ = this.authService.user$.pipe(
    defined(),
    switchMap((authUser) =>
      this.playersIncludingDisabled$.pipe(
        whenNotNull((players) =>
          of(players.find((player) => player.user_id === authUser.id) ?? null),
        ),
      ),
    ),
    shareReplay(1),
  );

  readonly userPlayer = toSignal(this.userPlayer$);

  readonly userPlayerId$ = this.userPlayer$.pipe(
    map((userPlayer) => userPlayer?.player_id ?? null),
    shareReplay(1),
  );

  readonly userPlayerId = toSignal(this.userPlayerId$);

  readonly userIsGameMaster$ = combineLatest({
    user: this.authService.user$,
    gameMasterUserId: this.sessionService.gameMasterUserId$,
  }).pipe(
    map(({ user, gameMasterUserId }) => user?.id === gameMasterUserId),
    shareReplay(1),
  );

  readonly userIsGameMaster = toSignal(this.userIsGameMaster$);

  async updateScore(playerId: number, score: number): Promise<void> {
    await showMessageOnError(
      this.supabase.from(Table.Player).update({ score }).eq('id', playerId),
      this.messageService,
      'Cannot update score',
    );
  }

  async setEnabled(
    playerId: number,
    displayName: string,
    enabled: boolean,
  ): Promise<void> {
    await showMessageOnError(
      this.supabase.from(Table.Player).update({ enabled }).eq('id', playerId),
      this.messageService,
      `Cannot ${enabled ? 'disable' : 'enable'} ${displayName}`,
    );
  }
}
