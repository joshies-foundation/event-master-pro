import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
} from '@angular/core';
import { DuelStatus } from '../util/supabase-helpers';
import { AvatarModule } from 'primeng/avatar';
import { DuelModel } from '../util/supabase-types';

@Component({
  selector: 'joshies-duel-table-avatars',
  imports: [AvatarModule],
  template: `
    <p-avatar
      [image]="duel().challenger!.avatar_url"
      shape="circle"
      class="relative"
    >
      @if (duel().status === DuelStatus.ChallengerWon) {
        <span class="absolute top-0 -mt-4">👑</span>
      }
    </p-avatar>

    <span class="mb-1 text-sm text-neutral-600">vs.</span>

    @if (duel().opponent; as opponent) {
      <p-avatar [image]="opponent.avatar_url" shape="circle" class="relative">
        @if (duel().status === DuelStatus.OpponentWon) {
          <span class="absolute top-0 -mt-4">👑</span>
        }
      </p-avatar>
    } @else {
      <i class="pi pi-question-circle -mt-1 text-4xl text-neutral-300"></i>
    }
  `,
  host: {
    class: 'flex items-center gap-2',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelTableAvatarsComponent {
  readonly duel = input.required<DuelModel>();

  @HostBinding('class') get class(): string {
    return [DuelStatus.ChallengerWon, DuelStatus.OpponentWon].includes(
      this.duel().status,
    )
      ? 'mt-4'
      : '';
  }

  protected readonly DuelStatus = DuelStatus;
}
