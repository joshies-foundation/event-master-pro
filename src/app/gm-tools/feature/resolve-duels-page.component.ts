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
import { SkeletonModule } from 'primeng/skeleton';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DuelService } from '../../shared/data-access/duel.service';
import { DuelModel } from '../../shared/util/supabase-types';
import { DuelsTableComponent } from '../ui/duels-table.component';

@Component({
  selector: 'joshies-resolve-duels-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    ButtonModule,
    SkeletonModule,
    RouterLink,
    DuelsTableComponent,
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
      <p class="mt-8">Duels for turn {{ roundNumber() }}</p>

      @if (duels.length) {
        <joshies-duels-table [duels]="duels" [editable]="true" />
      } @else {
        <p class="my-12 py-12 text-center text-neutral-500 italic">
          No duels for this turn
        </p>
      }

      @if (allDuelsAreResolved()) {
        <p-button
          label="Proceed to Chaos Space Event Phase"
          styleClass="w-full mt-4"
          (onClick)="proceedToChaosSpaceEventPhase()"
          [loading]="proceedingToNextPhase()"
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

  readonly proceedingToNextPhase = signal(false);

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
