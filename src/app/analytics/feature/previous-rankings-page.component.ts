import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  viewChild,
  input,
} from '@angular/core';
import { AnalyticsService } from '../data-access/analytics.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { startWith, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PlayerWithUserInfo } from '../../shared/data-access/player.service';
import { RankingsTableComponent } from '../../shared/ui/rankings-table.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { FormsModule } from '@angular/forms';
import { AnalyticsPreviousResolvedData } from '../data-access/previous-sessions.resolver';
import { nullWhenUndefinedElse } from '../../shared/util/rxjs-helpers';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';

@Component({
  selector: 'joshies-previous-rankings-page',
  standalone: true,
  imports: [
    DropdownModule,
    RankingsTableComponent,
    FormsModule,
    PageHeaderComponent,
    HeaderLinkComponent,
  ],
  template: `
    <joshies-page-header headerText="Previous Rankings" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (
      analyticsPreviousResolvedData().previousSessions;
      as previousSessions
    ) {
      <p-dropdown
        [options]="previousSessions"
        [ngModel]="analyticsPreviousResolvedData().mostRecentSessionId"
        optionLabel="name"
        optionValue="id"
        styleClass="w-full mt-5 mb-3"
        placeholder="Select a previous session"
      />
    }

    @if (viewModel(); as vm) {
      @if (vm.previousSessionPlayers; as previousSessionPlayers) {
        <joshies-rankings-table
          [players]="previousSessionPlayers"
          [userId]="vm.userId"
        />
      } @else {
        <p class="mt-6 pt-6 text-center text-500 font-italic">
          No previous sessions
        </p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PreviousRankingsPageComponent {
  readonly analyticsPreviousResolvedData =
    input.required<AnalyticsPreviousResolvedData>(); // route resolver param

  private readonly analyticsService = inject(AnalyticsService);
  private readonly authService = inject(AuthService);

  private readonly dropdown = viewChild.required(Dropdown);
  private readonly dropdown$ = toObservable(this.dropdown);

  private readonly previousSessionPlayers: Signal<
    PlayerWithUserInfo[] | null | undefined
  > = toSignal(
    this.dropdown$.pipe(
      nullWhenUndefinedElse((dropdown) =>
        dropdown.onChange.pipe(
          switchMap((event) =>
            this.analyticsService.getAllScoresFromSession(event.value),
          ),
          startWith(
            this.analyticsPreviousResolvedData().mostRecentSessionPlayers,
          ),
        ),
      ),
    ),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      previousSessionPlayers: this.previousSessionPlayers(),
      userId: this.authService.user()?.id,
    }),
  );

  getAllScoresFromSession(sessionId: number) {
    return this.analyticsService.getAllScoresFromSession(sessionId);
  }
}
