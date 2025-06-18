import { Component, inject, input, signal } from '@angular/core';
import { DuelTableAvatarsComponent } from '../../shared/ui/duel-table-avatars.component';
import { RouterLink } from '@angular/router';
import { StatusTagComponent } from './status-tag.component';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { DuelModel } from '../../shared/util/supabase-types';
import { DuelStatus, trackById } from '../../shared/util/supabase-helpers';
import { ButtonModule } from 'primeng/button';
import { DuelService } from '../../shared/data-access/duel.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';

@Component({
  selector: 'joshies-duels-table',
  template: ` <p-table [value]="duels()" [rowTrackBy]="trackById">
    <ng-template #header>
      <tr>
        <th class="pr-0">Players</th>
        <th>Game</th>
        <th class="px-0 text-right">Status</th>
        @if (cancelable()) {
          <th class="px-0"></th>
        }
        @if (editable()) {
          <th class="px-0"></th>
        }
      </tr>
    </ng-template>

    <ng-template #body let-duel [joshiesStronglyTypedTableRow]="duels()">
      <tr [routerLink]="editable() ? [duel.id] : null">
        <td class="pr-0">
          <joshies-duel-table-avatars [duel]="duel" />
        </td>
        <td class="text-sm">
          {{ duel.game_name }}
        </td>
        <td class="px-0 text-right">
          <joshies-status-tag [status]="duel.status" />
        </td>
        @if (cancelable()) {
          <td class="w-0 px-1 text-right">
            <p-button
              icon="pi pi-times"
              severity="danger"
              label="Cancel"
              [disabled]="!duelCancelable(duel)"
              (click)="confirmCancelDuel(duel)"
              [loading]="cancelingDuel()"
            />
          </td>
        }
        @if (editable()) {
          <td class="px-1">
            <i class="pi pi-angle-right text-neutral-400"></i>
          </td>
        }
      </tr>
    </ng-template>
  </p-table>`,
  imports: [
    AvatarModule,
    FormsModule,
    TableModule,
    StronglyTypedTableRowDirective,
    StatusTagComponent,
    RouterLink,
    DuelTableAvatarsComponent,
    ButtonModule,
  ],
})
export class DuelsTableComponent {
  private readonly duelService = inject(DuelService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly duels = input.required<DuelModel[]>();
  readonly editable = input<boolean>(false);
  readonly cancelable = input<boolean>(false);

  readonly trackById = trackById;
  readonly cancelingDuel = signal<boolean>(false);

  duelCancelable(duel: DuelModel): boolean {
    return (
      duel.status === DuelStatus.OpponentNotSelected ||
      duel.status === DuelStatus.WagerNotSelected ||
      duel.status === DuelStatus.GameNotSelected ||
      duel.status === DuelStatus.WaitingToBegin
    );
  }
  confirmCancelDuel(duel: DuelModel): void {
    const confirmationMessage = duel.opponent
      ? `Are you sure you want to cancel this duel between ${duel.challenger?.display_name} and ${duel.opponent.display_name}? This cannot be undone.`
      : `Are you sure you want to cancel this duel for ${duel.challenger?.display_name}? This cannot be undone.`;

    confirmBackendAction({
      action: async () => this.duelService.cancelDuel(duel.id),
      confirmationMessageText: confirmationMessage,
      successMessageText: 'Duel canceled',
      submittingSignal: this.cancelingDuel,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }
}
