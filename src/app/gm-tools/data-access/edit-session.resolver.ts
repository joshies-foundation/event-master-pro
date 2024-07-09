import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { SessionModel, UserModel } from '../../shared/util/supabase-types';
import { PlayerService } from '../../shared/data-access/player.service';
import { SessionService } from '../../shared/data-access/session.service';
import { UserService } from '../../shared/data-access/user.service';

export const editSessionResolver: ResolveFn<{
  session: SessionModel;
  allNonPlayerUsers: UserModel[];
}> = () => {
  const userService = inject(UserService);
  const sessionService = inject(SessionService);
  const playerService = inject(PlayerService);

  return combineLatest({
    session: sessionService.session$,
    allNonPlayerUsers: combineLatest({
      playerUserIds: playerService.playersIncludingDisabled$.pipe(
        map((players) => players.map((player) => player.user_id)),
      ),
      users: userService.allUsers$,
    }).pipe(
      map(({ playerUserIds, users }) =>
        users.filter((user) => !playerUserIds.includes(user.id)),
      ),
    ),
  });
};
