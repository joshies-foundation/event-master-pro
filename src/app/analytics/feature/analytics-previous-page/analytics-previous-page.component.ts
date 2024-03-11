import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  Signal,
  viewChild,
} from '@angular/core';
import { AnalyticsService } from '../../data-access/analytics.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { of, ReplaySubject, startWith, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerWithUserInfo } from '../../../shared/data-access/player.service';
import { RankingsTableComponent } from '../../../shared/ui/rankings-table/rankings-table.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { FormsModule } from '@angular/forms';
import { AnalyticsPreviousResolvedData } from '../../data-access/previous-sessions.resolver';

@Component({
  selector: 'joshies-analytics-previous-page',
  standalone: true,
  imports: [DropdownModule, RankingsTableComponent, FormsModule],
  templateUrl: './analytics-previous-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsPreviousPageComponent implements AfterViewInit {
  @Input()
  readonly analyticsPreviousResolvedData!: AnalyticsPreviousResolvedData; // route resolver param

  private readonly analyticsService = inject(AnalyticsService);
  private readonly authService = inject(AuthService);

  private readonly viewReady = new ReplaySubject<true>(1);
  private readonly dropdown = viewChild(Dropdown);

  private readonly previousSessionPlayers: Signal<
    PlayerWithUserInfo[] | null | undefined
  > = toSignal(
    this.viewReady.pipe(
      switchMap(() => {
        const dropdown = this.dropdown();
        if (!dropdown) return of(null);

        return dropdown.onChange.pipe(
          switchMap((event) =>
            this.analyticsService.getAllScoresFromSession(event.value),
          ),
          startWith(
            this.analyticsPreviousResolvedData.mostRecentSessionPlayers,
          ),
        );
      }),
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

  ngAfterViewInit(): void {
    this.viewReady.next(true);
  }
}
