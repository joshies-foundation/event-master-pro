import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
  viewChild,
} from '@angular/core';
import { AnalyticsService } from '../data-access/analytics.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { Select } from 'primeng/select';
import { startWith, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';
import { RankingsTableComponent } from '../../shared/ui/rankings-table.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { FormsModule } from '@angular/forms';
import { AnalyticsPreviousResolvedData } from '../data-access/previous-sessions.resolver';
import { nullWhenUndefinedElse } from '../../shared/util/rxjs-helpers';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';

@Component({
  selector: 'joshies-previous-rankings-page',
  imports: [
    Select,
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
      <p-select
        [options]="previousSessions"
        [ngModel]="analyticsPreviousResolvedData().mostRecentSessionId"
        optionLabel="name"
        optionValue="id"
        styleClass="w-full mt-8 mb-4"
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
        <p class="mt-12 pt-12 text-center text-neutral-500 italic">
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

  private readonly select = viewChild(Select);
  private readonly select$ = toObservable(this.select);

  private readonly previousSessionPlayers: Signal<
    PlayerWithUserAndRankInfo[] | null | undefined
  > = toSignal(
    this.select$.pipe(
      nullWhenUndefinedElse((select) =>
        select.onChange.pipe(
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
