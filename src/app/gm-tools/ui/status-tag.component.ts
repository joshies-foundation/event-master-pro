import { Component, computed, input, Signal } from '@angular/core';
import { Tag, TagModule } from '@openng/optimus-ui/tag';
import {
  DuelStatus,
  SpaceEventStatus,
} from '../../shared/util/supabase-helpers';
import { OpenngIcons } from '@openng/optimus-ui/api';
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
})
export class StatusTagComponent {
  readonly status = input.required<Status>();

  readonly icon: Signal<string> = computed(
    () =>
      ({
        [SpaceEventStatus.EventNotSelected]: '',
        [SpaceEventStatus.WaitingToBegin]: OpenngIcons.HOURGLASS,
        [SpaceEventStatus.InProgress]: OpenngIcons.PLAY,
        [SpaceEventStatus.Finished]: OpenngIcons.CHECK,
        [SpaceEventStatus.Canceled]: OpenngIcons.TIMES,
        [DuelStatus.OpponentNotSelected]: '',
        [DuelStatus.WagerNotSelected]: '',
        [DuelStatus.GameNotSelected]: '',
        [DuelStatus.ChallengerWon]: OpenngIcons.CROWN,
        [DuelStatus.OpponentWon]: OpenngIcons.CROWN,
      })[this.status()],
  );

  readonly severity: Signal<Tag['severity']> = computed(
    () =>
      (
        ({
          [SpaceEventStatus.EventNotSelected]: 'secondary',
          [SpaceEventStatus.WaitingToBegin]: 'warn',
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
