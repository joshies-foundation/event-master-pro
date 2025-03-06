import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Signal,
} from '@angular/core';
import { Tag, TagModule } from 'primeng/tag';
import {
  DuelStatus,
  SpaceEventStatus,
} from '../../shared/util/supabase-helpers';
import { PrimeIcons } from 'primeng/api';
import { SnakeCaseToTitleCasePipe } from '../../shared/ui/snake-case-to-title-case.pipe';

type Status = SpaceEventStatus | DuelStatus;

@Component({
  selector: 'joshies-status-tag',
  imports: [TagModule, SnakeCaseToTitleCasePipe],
  template: `
    <p-tag
      [icon]="icon()"
      [value]="status() | snakeCaseToTitleCase"
      [severity]="severity()"
    />
  `,
  styles: `
    :host ::ng-deep .p-tag-value {
      flex-shrink: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  readonly status = input.required<Status>();

  readonly icon: Signal<string> = computed(
    () =>
      ({
        [SpaceEventStatus.EventNotSelected]: '',
        [SpaceEventStatus.WaitingToBegin]: PrimeIcons.HOURGLASS,
        [SpaceEventStatus.InProgress]: PrimeIcons.PLAY,
        [SpaceEventStatus.Finished]: PrimeIcons.CHECK,
        [SpaceEventStatus.Canceled]: PrimeIcons.TIMES,
        [DuelStatus.OpponentNotSelected]: '',
        [DuelStatus.WagerNotSelected]: '',
        [DuelStatus.GameNotSelected]: '',
        [DuelStatus.ChallengerWon]: PrimeIcons.CROWN,
        [DuelStatus.OpponentWon]: PrimeIcons.CROWN,
      })[this.status()],
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
          [DuelStatus.OpponentNotSelected]: 'secondary',
          [DuelStatus.WagerNotSelected]: 'secondary',
          [DuelStatus.GameNotSelected]: 'secondary',
          [DuelStatus.ChallengerWon]: 'success',
          [DuelStatus.OpponentWon]: 'success',
        }) as Record<Status, Tag['severity']>
      )[this.status()],
  );
}
