import { Injectable, computed, inject } from '@angular/core';
import {
  realtimeUpdatesFromTableAsSignal,
  Table,
} from '../util/supabase-helpers';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class GameMasterService {
  private readonly userService = inject(UserService);

  private readonly allGameMasters = realtimeUpdatesFromTableAsSignal(
    Table.GameMaster,
  );

  readonly gameMasterUserId = computed(() => this.allGameMasters()[0].user_id);

  readonly userIsGameMaster = computed(
    () => this.userService.user().id === this.gameMasterUserId(),
  );
}
