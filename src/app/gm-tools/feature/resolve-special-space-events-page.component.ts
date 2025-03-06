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
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatusTagComponent } from '../ui/status-tag.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SpecialSpaceEventModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-resolve-special-space-events-page',
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    ButtonModule,
    AvatarModule,
    SkeletonModule,
    SelectButtonModule,
    FormsModule,
    TableModule,
    StronglyTypedTableRowDirective,
    StatusTagComponent,
    RouterLink,
  ],
  template: `
    <joshies-page-header headerText="Special Space Events" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (specialSpaceEvents(); as specialSpaceEvents) {
      <p class="mt-5">Special Space events for turn {{ roundNumber() }}</p>

      @if (specialSpaceEvents.length) {
        <p-table [value]="specialSpaceEvents" [rowTrackBy]="trackById">
          <ng-template pTemplate="header">
            <tr>
              <th class="pr-0">Player</th>
              <th>Event</th>
              <th class="text-right px-0">Status</th>
              <th class="px-0"></th>
            </tr>
          </ng-template>

          <ng-template
            pTemplate="body"
            let-specialSpaceEvent
            [joshiesStronglyTypedTableRow]="specialSpaceEvents"
          >
            <tr [routerLink]="[specialSpaceEvent.id]">
              <td class="pr-0">
                <div class="flex align-items-center">
                  <p-avatar
                    [image]="specialSpaceEvent.player?.avatar_url!"
                    shape="circle"
                    styleClass="mr-2"
                  />
                  {{ specialSpaceEvent.player?.display_name }}
                </div>
              </td>
              <td class="text-sm">
                {{ specialSpaceEvent.template?.name ?? '?' }}
              </td>
              <td class="text-right px-0">
                <joshies-status-tag [status]="specialSpaceEvent.status" />
              </td>
              <td class="px-1">
                <i class="pi pi-angle-right text-400"></i>
              </td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <p class="my-6 py-6 text-center text-500 font-italic">
          No special space events for this turn
        </p>
      }

      @if (allSpecialSpaceEventsAreResolved()) {
        <p-button
          label="Proceed to Duel Phase"
          styleClass="w-full mt-3"
          (onClick)="proceedToDuelPhase()"
        />
      }
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveSpecialSpaceEventsPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly gameStateService = inject(GameStateService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly specialSpaceEvents: Signal<
    SpecialSpaceEventModel[] | null | undefined
  > = toSignal(this.gameboardService.specialSpaceEventsForThisTurn$);

  readonly allSpecialSpaceEventsAreResolved: Signal<boolean | undefined> =
    toSignal(
      this.gameboardService.allSpecialSpaceEventsForThisTurnAreResolved$,
    );

  readonly roundNumber = this.gameStateService.roundNumber;

  proceedingToDuelPhase = signal(false);

  proceedToDuelPhase(): void {
    confirmBackendAction({
      confirmationMessageText: 'Proceed to the Duel phase?',
      successMessageText: "We're now in the Duel phase",
      action: async () => this.gameStateService.setRoundPhase(RoundPhase.Duels),
      messageService: this.messageService,
      confirmationService: this.confirmationService,
      submittingSignal: this.proceedingToDuelPhase,
      successNavigation: '..',
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
  protected readonly trackById = trackById;
}
