import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  GameboardSpaceEffect,
  SpaceEventStatus,
} from '../../shared/util/supabase-helpers';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { StatusTagComponent } from '../../gm-tools/ui/status-tag.component';
import {
  ChaosSpaceEventModel,
  SpecialSpaceEventModel,
} from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-space-event-table',
  standalone: true,
  imports: [AvatarModule, ButtonModule, StatusTagComponent],
  template: `
    <table class="w-full">
      <tbody>
        @for (spaceEvent of spaceEvents(); track spaceEvent.id) {
          <tr>
            <td class="pt-1 pr-2">
              <div class="flex align-items-center gap-2">
                <p-avatar
                  [image]="spaceEvent.player?.avatar_url"
                  shape="circle"
                />
                {{ spaceEvent.player?.display_name }}
              </div>
            </td>

            <td class="pt-1 text-sm">
              {{ spaceEvent.template?.name }}
            </td>

            <td class="pt-1 text-right">
              @if (spaceEvent.status === SpaceEventStatus.WaitingToBegin) {
                <!-- TODO: Link to pre-populated place bet page -->
                <p-button size="small" label="Place Bet" />
              } @else {
                <joshies-status-tag [status]="spaceEvent.status" />
              }
            </td>
          </tr>
        } @empty {
          <tr>
            <td class="font-italic text-600">
              No {{ spaceType() }} space events for this turn
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceEventTableComponent {
  spaceEvents = input.required<
    (SpecialSpaceEventModel | ChaosSpaceEventModel)[] | null | undefined
  >();

  spaceType = input.required<GameboardSpaceEffect>();

  protected readonly SpaceEventStatus = SpaceEventStatus;
}
