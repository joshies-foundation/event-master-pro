import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { BetModel, PlayerModel } from '../util/supabase-types';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { BetStatus } from '../util/supabase-helpers';
import { DecimalPipe } from '@angular/common';
import { betGainOrLossAmount, betIsResolved } from '../util/bet-helpers';
import { NumberWithSignAndColorPipe } from './number-with-sign-and-color.pipe';

@Component({
  selector: 'joshies-bet',
  standalone: true,
  imports: [
    AvatarGroupModule,
    AvatarModule,
    DecimalPipe,
    NumberWithSignAndColorPipe,
  ],
  template: `
    <table class="w-full">
      <tbody>
        <tr>
          <!-- Avatars -->
          <td class="vertical-align-top w-1rem">
            <p-avatarGroup styleClass="mr-2">
              @for (
                avatarUrl of mainAvatarUrls();
                track index;
                let index = $index
              ) {
                <p-avatar
                  [image]="avatarUrl"
                  size="large"
                  shape="circle"
                  [styleClass]="'mb-2 ' + avatarBorderColorClass()"
                />
              }
            </p-avatarGroup>
          </td>

          <!-- Title & Description -->
          <td>
            <h4 class="mt-0 mb-2 text-lg">{{ titleText() }}</h4>
            <p class="mt-0 mb-2">{{ bet().description }}</p>
          </td>

          @if (bet().status === BetStatus.Active) {
            <td class="vertical-align-top text-right text-xl">
              <span class="pl-2 pb-2">⏳</span>
            </td>
          } @else if (resultAmount() !== null) {
            <td class="vertical-align-top text-right text-xl">
              <span
                [innerHTML]="resultAmount()! | numberWithSignAndColor"
              ></span>
            </td>
          }
        </tr>

        @if (bothWagersAreEqual()) {
          <!-- Both Wager -->
          <tr>
            <td>
              <p-avatarGroup styleClass="justify-content-end mr-1">
                <p-avatar
                  [image]="bet().requester?.avatar_url"
                  [styleClass]="
                    'h-1.75rem w-1.75rem ' + avatarBorderColorClass()
                  "
                  shape="circle"
                />
                <p-avatar
                  [image]="bet().opponent?.avatar_url"
                  [styleClass]="
                    'h-1.75rem w-1.75rem ' + avatarBorderColorClass()
                  "
                  shape="circle"
                />
              </p-avatarGroup>
            </td>
            <td>
              Both {{ youOrBothWagerWord() }}
              <strong>
                {{ bet().requester_wager | number }}
              </strong>
              point{{ bet().requester_wager === 1 ? '' : 's' }}
            </td>
          </tr>
        } @else {
          <!-- Requester Wager -->
          <tr>
            <td class="text-right">
              <p-avatar
                [image]="bet().requester?.avatar_url"
                [styleClass]="
                  'h-1.75rem w-1.75rem border-2 mr-1 ' +
                  avatarBorderColorClass()
                "
                shape="circle"
              />
            </td>
            <td>
              {{ userIsRequester() ? 'You' : bet().requester?.display_name }}
              {{
                userIsRequester()
                  ? youOrBothWagerWord()
                  : otherPlayerWagerWord()
              }}
              <strong>
                {{ bet().requester_wager | number }}
              </strong>
              point{{ bet().requester_wager === 1 ? '' : 's' }}
            </td>
          </tr>

          <!-- Opponent Wager -->
          <tr>
            <td class="text-right">
              <p-avatar
                [image]="bet().opponent?.avatar_url"
                [styleClass]="
                  'h-1.75rem w-1.75rem border-2 mr-1 ' +
                  avatarBorderColorClass()
                "
                shape="circle"
              />
            </td>
            <td>
              {{ userIsRequester() ? bet().opponent?.display_name : 'You' }}
              {{
                userIsRequester()
                  ? otherPlayerWagerWord()
                  : youOrBothWagerWord()
              }}
              <strong>
                {{ bet().opponent_wager | number }}
              </strong>
              point{{ bet().opponent_wager === 1 ? '' : 's' }}
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    td {
      padding: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BetComponent {
  bet = input.required<BetModel>();
  userPlayerId = input<PlayerModel['id']>();
  avatarBorderColorClass = input('border-50');

  readonly userIsPartOfBet = computed(() =>
    [this.bet().requester_player_id, this.bet().opponent_player_id].includes(
      this.userPlayerId() as PlayerModel['id'],
    ),
  );

  readonly userIsRequester = computed(
    () => this.userPlayerId() === this.bet().requester_player_id,
  );

  readonly titleText = computed(() => {
    if (!this.userIsPartOfBet())
      return `${this.bet().requester?.display_name} bets ${this.bet().opponent?.display_name}`;

    if (this.userIsRequester())
      return `You bet ${this.bet().opponent?.display_name}`;

    return `${this.bet().requester?.display_name} bets You`;
  });

  readonly mainAvatarUrls = computed(() => {
    if (!this.userIsPartOfBet())
      return [
        this.bet().requester?.avatar_url,
        this.bet().opponent?.avatar_url,
      ];

    // return the other player's avatar
    if (this.userIsRequester()) return [this.bet().opponent?.avatar_url];

    return [this.bet().requester?.avatar_url];
  });

  readonly bothWagersAreEqual = computed(
    () => this.bet().requester_wager === this.bet().opponent_wager,
  );

  readonly usingPastTense = computed(
    () => this.bet().status !== BetStatus.PendingAcceptance,
  );

  readonly youOrBothWagerWord = computed(() =>
    this.usingPastTense() ? 'wagered' : 'wager',
  );

  readonly otherPlayerWagerWord = computed(() =>
    this.usingPastTense() ? 'wagered' : 'wagers',
  );

  readonly resultAmount = computed(() => {
    if (!this.userIsPartOfBet() || !betIsResolved(this.bet().status))
      return null;

    return betGainOrLossAmount(this.bet(), this.userPlayerId()!);
  });

  protected readonly BetStatus = BetStatus;
}
