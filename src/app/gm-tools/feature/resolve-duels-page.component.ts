import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ButtonModule } from 'primeng/button';
import {
  DuelStatus,
  RoundPhase,
  trackById,
} from '../../shared/util/supabase-helpers';
import { MovesWithSpaceIdPipe } from '../ui/moves-with-space-id.pipe';
import { AvatarModule } from 'primeng/avatar';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { SpacesWithEffectPipe } from '../ui/spaces-with-effect.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LoseOrGainPipe } from '../ui/lose-or-gain.pipe';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatusTagComponent } from '../ui/status-tag.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DuelService } from '../../shared/data-access/duel.service';
import { DuelModel } from '../../shared/util/supabase-types';
import { DuelTableAvatarsComponent } from '../../shared/ui/duel-table-avatars.component';

@Component({
  selector: 'joshies-resolve-duels-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    ButtonModule,
    MovesWithSpaceIdPipe,
    AvatarModule,
    DecimalPipe,
    SpacesWithEffectPipe,
    SkeletonModule,
    SelectButtonModule,
    LoseOrGainPipe,
    TitleCasePipe,
    NumberWithSignAndColorPipe,
    FormsModule,
    TableModule,
    StronglyTypedTableRowDirective,
    StatusTagComponent,
    RouterLink,
    DuelTableAvatarsComponent,
  ],
  template: `
    <joshies-page-header headerText="Duels" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (duels(); as duels) {
      <p class="mt-5">Duels for turn {{ roundNumber() }}</p>

      @if (duels.length) {
        <p-table [value]="duels" [rowTrackBy]="trackById">
          <ng-template pTemplate="header">
            <tr>
              <th class="pr-0">Players</th>
              <th>Game</th>
              <th class="text-right px-0">Status</th>
              <th class="px-0"></th>
            </tr>
          </ng-template>

          <ng-template
            pTemplate="body"
            let-duel
            [joshiesStronglyTypedTableRow]="duels"
          >
            <tr [routerLink]="[duel.id]">
              <td class="pr-0">
                <joshies-duel-table-avatars [duel]="duel" />
              </td>
              <td class="text-sm">
                {{ duel.game_name }}
              </td>
              <td class="text-right px-0">
                <joshies-status-tag [status]="duel.status" />
              </td>
              <td class="px-1">
                <i class="pi pi-angle-right text-400"></i>
              </td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <p class="my-6 py-6 text-center text-500 font-italic">
          No duels for this turn
        </p>
      }

      @if (allDuelsAreResolved()) {
        <p-button
          label="Proceed to Chaos Space Event Phase"
          styleClass="w-full mt-3"
          (onClick)="proceedToChaosSpaceEventPhase()"
        />
      }
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveDuelsPageComponent {
  private readonly duelService = inject(DuelService);
  private readonly gameStateService = inject(GameStateService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly duels: Signal<DuelModel[] | undefined> = toSignal(
    this.duelService.duelsForThisTurn$,
  );

  readonly allDuelsAreResolved: Signal<boolean | undefined> = toSignal(
    this.duelService.allDuelsForThisTurnAreResolved$,
  );

  readonly roundNumber = this.gameStateService.roundNumber;

  proceedingToNextPhase = signal(false);

  proceedToChaosSpaceEventPhase(): void {
    confirmBackendAction({
      confirmationMessageText: 'Proceed to the Chaos Space Event phase?',
      successMessageText: "We're in the Chaos Space Event phase",
      action: async () =>
        this.gameStateService.setRoundPhase(RoundPhase.ChaosSpaceEvents),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.proceedingToNextPhase,
      successNavigation: '..',
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }

  protected readonly trackById = trackById;
  protected readonly DuelStatus = DuelStatus;
}
