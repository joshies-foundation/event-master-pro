import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Signal,
} from '@angular/core';
import { Tag, TagModule } from 'primeng/tag';
import { SpaceEventStatus } from '../../shared/util/supabase-helpers';
import { PrimeIcons } from 'primeng/api';
import { SnakeCaseToTitleCasePipe } from '../../shared/ui/snake-case-to-title-case.pipe';

@Component({
  selector: 'joshies-space-event-status-tag',
  standalone: true,
  imports: [TagModule, SnakeCaseToTitleCasePipe],
  template: `
    <p-tag
      [icon]="icon()"
      [value]="spaceEventStatus() | snakeCaseToTitleCase"
      [severity]="severity()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceEventStatusTagComponent {
  readonly spaceEventStatus = input.required<SpaceEventStatus>();

  readonly icon: Signal<string> = computed(
    () =>
      ({
        [SpaceEventStatus.EventNotSelected]: PrimeIcons.QUESTION,
        [SpaceEventStatus.WaitingToBegin]: PrimeIcons.HOURGLASS,
        [SpaceEventStatus.InProgress]: PrimeIcons.PLAY,
        [SpaceEventStatus.Finished]: PrimeIcons.CHECK,
        [SpaceEventStatus.Canceled]: PrimeIcons.TIMES,
      })[this.spaceEventStatus()],
  );

  readonly severity: Signal<Tag['severity']> = computed(
    () =>
      (
        ({
          [SpaceEventStatus.EventNotSelected]: 'secondary',
          [SpaceEventStatus.WaitingToBegin]: 'warning',
          [SpaceEventStatus.InProgress]: 'info',
          [SpaceEventStatus.Finished]: 'success',
          [SpaceEventStatus.Canceled]: 'danger',
        }) as Record<SpaceEventStatus, Tag['severity']>
      )[this.spaceEventStatus()],
  );
}
