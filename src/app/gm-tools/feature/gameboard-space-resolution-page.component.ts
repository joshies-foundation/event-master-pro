import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import {
  GameboardSpaceEffect,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { MovesForCurrentRoundModel } from '../../shared/util/supabase-types';
import { PostgrestResponse } from '@supabase/supabase-js';
import { MovesWithSpaceIdPipe } from '../ui/moves-with-space-id.pipe';
import { AvatarModule } from 'primeng/avatar';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { SpacesWithEffectPipe } from '../ui/spaces-with-effect.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LoseOrGainPipe } from '../ui/lose-or-gain.pipe';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';

@Component({
  selector: 'joshies-gameboard-space-resolution-page',
  standalone: true,
  imports: [
    HeaderLinkComponent,
    PageHeaderComponent,
    StepperModule,
    ButtonModule,
    MovesWithSpaceIdPipe,
    AvatarModule,
    DecimalPipe,
    SpacesWithEffectPipe,
    SkeletonModule,
    SelectButtonModule,
    LoseOrGainPipe,
    TitleCasePipe,
    NumberWithSignAndColorPipe,
    FormsModule,
    TableModule,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="Space Resolution" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <p class="mt-5">Apply the effects of each space</p>

    @if (error()) {
      <p class="text-red">Error: {{ error() }}</p>
    } @else {
      @if (spaces(); as spaces) {
        <p-stepper orientation="vertical" [linear]="true">
          <!-- "Gain Points Or Do Activity" Spaces-->
          @for (
            space of spaces
              | spacesWithEffect: GameboardSpaceEffect.GainPointsOrDoActivity;
            track space.id
          ) {
            <p-stepperPanel [header]="'Resolve ' + space.name + ' Spaces'">
              <ng-template
                pTemplate="content"
                let-nextCallback="nextCallback"
                let-index="index"
              >
                <p-table
                  [value]="gameboardMoves() | movesWithSpaceId: space.id"
                  [rowTrackBy]="trackByPlayerId"
                >
                  <ng-template
                    pTemplate="body"
                    let-move
                    [joshiesStronglyTypedTableRow]="gameboardMoves()"
                  >
                    <tr>
                      <td class="p-0">
                        <div class="flex align-items-center">
                          <p-avatar
                            [image]="move.avatar_url!"
                            shape="circle"
                            styleClass="mr-2"
                          />
                          {{ move.display_name }}
                        </div>
                      </td>
                      <td>
                        <p-selectButton
                          #pointsOrActivity
                          [options]="[
                            {
                              label:
                                ($any(space.effect_data)?.pointsGained ?? 0
                                  | loseOrGain
                                  | titlecase) + ' points',
                              value: 'points'
                            },
                            {
                              label:
                                $any(space.effect_data)?.activity
                                  ?.description ?? 'Do activity',
                              value: 'activity'
                            }
                          ]"
                          optionLabel="label"
                          optionValue="value"
                          ngModel="points"
                        />
                      </td>
                      <td
                        class="text-right p-0"
                        [innerHTML]="
                          (pointsOrActivity.value === 'points'
                            ? $any(space.effect_data)?.pointsGained ?? 0
                            : 0
                          ) | numberWithSignAndColor
                        "
                      ></td>
                    </tr>
                  </ng-template>
                </p-table>
                <table>
                  <tbody></tbody>
                </table>
                <div class="flex py-4">
                  <p-button label="Submit" (onClick)="nextCallback.emit()" />
                </div>
              </ng-template>
            </p-stepperPanel>
          }
          <p-stepperPanel header="Header II">
            <ng-template
              pTemplate="content"
              let-prevCallback="prevCallback"
              let-nextCallback="nextCallback"
              let-index="index"
            >
              <div class="flex flex-column h-12rem">
                <div
                  class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium"
                >
                  Content II
                </div>
              </div>
              <div class="flex py-4 gap-2">
                <p-button
                  label="Back"
                  severity="secondary"
                  (onClick)="prevCallback.emit()"
                />
                <p-button label="Next" (onClick)="nextCallback.emit()" />
              </div>
            </ng-template>
          </p-stepperPanel>
          <p-stepperPanel header="Header III">
            <ng-template
              pTemplate="content"
              let-prevCallback="prevCallback"
              let-index="index"
            >
              <div class="flex flex-column h-12rem">
                <div
                  class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium"
                >
                  Content III
                </div>
              </div>
              <div class="flex py-4">
                <p-button label="Back" (onClick)="prevCallback.emit()" />
              </div>
            </ng-template>
          </p-stepperPanel>
        </p-stepper>
      } @else {
        <p-skeleton height="30rem" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GameboardSpaceResolutionPageComponent {
  private readonly gameboardService = inject(GameboardService);

  readonly gameboardMovesResponse =
    input.required<PostgrestResponse<MovesForCurrentRoundModel>>();

  readonly error = computed(() => this.gameboardMovesResponse().error?.message);

  readonly gameboardMoves = computed(() => this.gameboardMovesResponse().data!);

  readonly spaces = this.gameboardService.gameboardSpaces;

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
  protected readonly trackByPlayerId = trackByPlayerId;
}
