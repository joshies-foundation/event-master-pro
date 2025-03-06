import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import {
  PlayerService,
  PlayerWithUserAndRankInfo,
} from '../../../shared/data-access/player.service';
import { GameboardSpaceModel } from '../../../shared/util/supabase-types';
import { GameboardService } from '../../../shared/data-access/gameboard.service';

@Component({
  selector: 'joshies-gameboard-bet',
  imports: [DropdownModule, FormsModule],
  template: `
    <div class="flex flex-column gap-3">
      <!-- Bet Player Dropdown -->
      <label class="flex flex-column gap-2">
        Player
        <p-dropdown
          [options]="playerService.players() ?? []"
          [(ngModel)]="selectedGameboardPlayer"
          optionLabel="display_name"
          styleClass="flex"
          placeholder="Select a player"
        />
      </label>

      <!-- Gameboard Space Dropdown -->
      <label class="flex flex-column gap-2">
        Next Gameboard Space
        <p-dropdown
          [options]="gameboardService.gameboardSpaces() ?? []"
          [(ngModel)]="selectedGameboardSpace"
          optionLabel="name"
          styleClass="flex"
          placeholder="Select a space type"
        />
      </label>
    </div>
  `,
})
export class GameboardBetComponent {
  readonly playerService = inject(PlayerService);
  readonly gameboardService = inject(GameboardService);

  readonly selectedGameboardPlayer = model<PlayerWithUserAndRankInfo | null>(
    null,
  );
  readonly selectedGameboardSpace = model<GameboardSpaceModel | null>(null);
}
