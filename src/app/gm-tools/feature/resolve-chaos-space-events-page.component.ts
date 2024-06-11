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
import { GameboardService } from '../../shared/data-access/gameboard.service';
import {
  GameboardSpaceEffect,
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
import { ChaosSpaceEventModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-resolve-chaos-space-events-page',
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
  ],
  template: `
    <joshies-page-header headerText="Chaos Space Events" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (chaosSpaceEvents(); as chaosSpaceEvents) {
      <p class="mt-5">Chaos Space events for turn {{ roundNumber() }}</p>

      @if (chaosSpaceEvents.length) {
        <p-table [value]="chaosSpaceEvents" [rowTrackBy]="trackById">
          <ng-template pTemplate="header">
            <tr>
              <th class="px-0">Player</th>
              <th>Event</th>
              <th class="text-right px-0">Status</th>
              <th class="px-0"></th>
            </tr>
          </ng-template>

          <ng-template
            pTemplate="body"
            let-chaosSpaceEvent
            [joshiesStronglyTypedTableRow]="chaosSpaceEvents"
          >
            <tr [routerLink]="[chaosSpaceEvent.id]">
              <td class="px-0">
                <div class="flex align-items-center">
                  <p-avatar
                    [image]="chaosSpaceEvent.player?.avatar_url!"
                    shape="circle"
                    styleClass="mr-2"
                  />
                  {{ chaosSpaceEvent.player?.display_name }}
                </div>
              </td>
              <td>
                {{ chaosSpaceEvent.template?.name ?? '?' }}
              </td>
              <td class="text-right px-0">
                <joshies-status-tag [status]="chaosSpaceEvent.status" />
              </td>
              <td class="pl-1 pr-0">
                <i class="pi pi-angle-right text-400"></i>
              </td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <p class="my-6 py-6 text-center text-500 font-italic">
          No chaos space events for this turn
        </p>
      }

      @if (allChaosSpaceEventsAreResolved()) {
        <p-button
          label="Proceed to Event Phase"
          styleClass="w-full mt-3"
          (onClick)="proceedToEventPhase()"
        />
      }
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveChaosSpaceEventsPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly gameStateService = inject(GameStateService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly chaosSpaceEvents: Signal<ChaosSpaceEventModel[] | null | undefined> =
    toSignal(this.gameboardService.chaosSpaceEventsForThisTurn$);

  readonly allChaosSpaceEventsAreResolved: Signal<boolean | undefined> =
    toSignal(this.gameboardService.allChaosSpaceEventsForThisTurnAreResolved$);

  readonly roundNumber = this.gameStateService.roundNumber;

  proceedingToEventPhase = signal(false);

  proceedToEventPhase(): void {
    confirmBackendAction({
      confirmationMessageText: 'Proceed to the Event phase?',
      successMessageText: "We're now in the Event phase",
      action: async () => this.gameStateService.setRoundPhase(RoundPhase.Event),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.proceedingToEventPhase,
      successNavigation: '..',
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
  protected readonly trackById = trackById;
}
