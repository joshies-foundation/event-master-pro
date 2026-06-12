import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PastSessionPrizes } from '../data-access/analytics.service';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PrizeGalleryComponent } from '../../prizes/ui/prize-gallery.component';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'joshies-previous-prizes-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    PrizeGalleryComponent,
    SkeletonModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <joshies-page-header headerText="Past Prizes" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (sessions().length) {
      @for (session of sessions(); track session.session_id) {
        <section class="mt-6 px-1">
          <h2 class="text-base font-semibold">
            {{ session.session_name }}
          </h2>
          <p class="mb-2 text-xs text-neutral-500">
            {{ session.session_end_date | date: 'mediumDate' }}
          </p>
          <joshies-prize-gallery [prizes]="session.prizes" />
        </section>
      }
    } @else {
      <p class="pt-8 text-center text-sm text-neutral-500">
        You haven't won any prizes in past sessions yet.
      </p>
    }
  `,
})
export default class PreviousPrizesPageComponent {
  readonly sessions = input.required<PastSessionPrizes[]>();
}
