import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import {
  PlayerService,
  PlayerWithUserAndRankInfo,
} from '../../shared/data-access/player.service';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ActivatedRoute, Router } from '@angular/router';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { defined } from '../../shared/util/rxjs-helpers';
import {
  concat,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import {
  getRecordFromLocalStorage,
  LocalStorageRecord,
  saveRecordToLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  GameboardSpaceEffect,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { InputNumberModule } from 'primeng/inputnumber';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { ReturnSpaceWithIdIfItsEffectIsPipe } from '../../shared/ui/return-space-with-id-if-its-effect-is.pipe';
import { LoseOrGainPipe } from '../ui/lose-or-gain.pipe';
import { GameboardSpaceModel } from '../../shared/util/supabase-types';
import { CheckboxModule } from 'primeng/checkbox';
import NewDuelComponent from '../ui/new-duel.component';

interface GameboardSpaceEntryFormKeys {
  distanceTraveled: number;
  gameboardSpaceId: number;
  decision?: 'points' | 'activity';
  triggersDuel: boolean;
  triggeredDuelCreated: boolean;
}
export type GameboardSpaceEntryFormModel = Record<
  string,
  GameboardSpaceEntryFormKeys
>;

@Component({
  selector: 'joshies-space-entry-page',
  template: `
    <joshies-page-header headerText="Move Entry" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <p class="mt-8 mb-4">
        Enter gameboard moves for turn
        <strong>{{ vm.roundNumber }}</strong>
      </p>
      <!-- Fixed layout allows individual scrolling of cells instead of whole table -->
      <p-table
        [value]="vm.players!"
        [defaultSortOrder]="-1"
        [formGroup]="vm.formGroup"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
        [tableStyle]="{ 'table-layout': 'fixed' }"
      >
        <ng-template #header>
          <tr>
            <th class="w-32 p-0"></th>
            <th class="p-0"></th>
          </tr>
        </ng-template>
        <ng-template
          #body
          [joshiesStronglyTypedTableRow]="vm.players!"
          let-player
        >
          <tr [formGroupName]="player.player_id">
            <!-- Player -->
            <td>
              <div class="-py-2 flex items-center gap-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 rounded-full bg-neutral-100"
                />
                {{ player.display_name }}
              </div>
            </td>
            <!-- Distance -->
            <td class="overflow-hidden text-right">
              <div class="flex flex-row items-center justify-end gap-2">
                <p-input-number
                  formControlName="distanceTraveled"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  [step]="1"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  inputStyleClass="w-full font-semibold text-center"
                  placeholder="Dice Roll"
                />
                <label>
                  Duel?
                  <p-checkbox
                    binary
                    formControlName="triggersDuel"
                    [readonly]="
                      vm.formValue[player.player_id].triggeredDuelCreated
                    "
                  />
                </label>
              </div>

              @if (
                vm.formValue[player.player_id].triggersDuel &&
                !vm.formValue[player.player_id].triggeredDuelCreated
              ) {
                <joshies-new-duel
                  [challenger]="player"
                  [inline]="true"
                  (submitted)="duelCreated(player.player_id)"
                />
              }

              <!-- Space -->
              <div class="mt-2 overflow-x-auto text-nowrap">
                <p-select-button
                  [options]="vm.gameboardSpaces"
                  optionLabel="id"
                  optionValue="id"
                  formControlName="gameboardSpaceId"
                  [allowEmpty]="false"
                >
                  <ng-template #item let-gameboardSpace>
                    <joshies-gameboard-space [model]="gameboardSpace" />
                  </ng-template>
                </p-select-button>
              </div>

              <!-- If player must choose between gaining/losing points and doing an activity, show the options here-->
              @if (
                vm.gameboardSpaces
                  | returnSpaceWithIdIfItsEffectIs
                    : vm.formValue[player.player_id].gameboardSpaceId
                    : GameboardSpaceEffect.GainPointsOrDoActivity;
                as space
              ) {
                <p-select-button
                  [options]="[
                    {
                      label:
                        ($any(space.effect_data)?.pointsGained ?? 0
                          | loseOrGain
                          | titlecase) + ' points',
                      value: 'points',
                    },
                    {
                      label:
                        $any(space.effect_data)?.alternativeActivity ??
                        'Do activity',
                      value: 'activity',
                    },
                  ]"
                  formControlName="decision"
                  styleClass="mt-2"
                />
              }
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-button
        label="Review Moves"
        styleClass="mt-6 w-full"
        (onClick)="reviewGameboardSpaces()"
        icon="pi pi-chevron-right"
        iconPos="right"
        [disabled]="formGroup()!.status === 'INVALID'"
      />
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    NgOptimizedImage,
    TableModule,
    ButtonModule,
    SkeletonModule,
    GameboardSpaceComponent,
    StronglyTypedTableRowDirective,
    ReactiveFormsModule,
    SelectButtonModule,
    InputNumberModule,
    FormsModule,
    LoseOrGainPipe,
    TitleCasePipe,
    ReturnSpaceWithIdIfItsEffectIsPipe,
    CheckboxModule,
    NewDuelComponent,
  ],
})
export default class GameboardSpaceEntryPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly gameboardService = inject(GameboardService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly initialFormValue: Partial<GameboardSpaceEntryFormModel> =
    getRecordFromLocalStorage(LocalStorageRecord.GameboardSpaceEntryFormValue);

  private readonly formGroup$: Observable<
    ModelFormGroup<GameboardSpaceEntryFormModel>
  > = this.playerService.players$.pipe(
    defined(),
    take(1), // take 1 so a player changing their name or picture doesn't reset the form
    map(
      (players): FormGroup =>
        this.formBuilder.nonNullable.group(
          players!.reduce(
            (prev, player) => ({
              ...prev,
              [player.player_id]: this.formBuilder.group({
                distanceTraveled: [
                  this.initialFormValue?.[player.player_id]?.distanceTraveled,
                  Validators.required,
                ],
                gameboardSpaceId: [
                  this.initialFormValue?.[player.player_id]?.gameboardSpaceId,
                  Validators.required,
                ],
                decision: [
                  this.initialFormValue?.[player.player_id]?.decision ??
                    'points',
                  Validators.required,
                ],
                triggersDuel: [
                  this.initialFormValue?.[player.player_id]?.triggersDuel ??
                    false,
                ],
                triggeredDuelCreated: [
                  this.initialFormValue?.[player.player_id]
                    ?.triggeredDuelCreated ?? false,
                ],
              }),
            }),
            {},
          ),
        ),
    ),
    shareReplay(1),
  );

  readonly formGroup: Signal<
    ModelFormGroup<GameboardSpaceEntryFormModel> | undefined
  > = toSignal(this.formGroup$);

  private readonly formValueChanges$: Observable<GameboardSpaceEntryFormModel> =
    this.formGroup$.pipe(
      switchMap(
        (formGroup) =>
          formGroup.valueChanges as Observable<GameboardSpaceEntryFormModel>,
      ),
      shareReplay(1),
    );

  private readonly formValue: Signal<GameboardSpaceEntryFormModel | undefined> =
    toSignal(
      this.formGroup$.pipe(
        switchMap(
          (formGroup) =>
            concat(
              of(formGroup.value),
              formGroup.valueChanges,
            ) as Observable<GameboardSpaceEntryFormModel>,
        ),
        shareReplay(1),
      ),
    );

  private readonly formValueChanges: Signal<
    Partial<GameboardSpaceEntryFormModel> | undefined
  > = toSignal(this.formValueChanges$);

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      roundNumber: this.roundNumber(),
      formGroup: this.formGroup(),
      formValue: this.formValue(),
      players: this.playerService.players(),
      gameboardSpaces: this.gameboardService.gameboardSpaces() as
        | GameboardSpaceModel[]
        | undefined,
    }),
  );

  private readonly saveFormUpdatesToLocalStorage = effect(() => {
    if (this.formValueChanges()) {
      saveRecordToLocalStorage(
        LocalStorageRecord.GameboardSpaceEntryFormValue,
        this.formValueChanges()!,
      );
    }
  });

  reviewGameboardSpaces(): void {
    this.router.navigate(['review'], {
      relativeTo: this.activatedRoute,
    });
  }

  duelCreated(playerId: PlayerWithUserAndRankInfo['player_id']): void {
    const formGroup = this.formGroup();
    if (!formGroup) return;
    const playerGroup = formGroup.get(String(playerId));
    if (playerGroup) {
      playerGroup.patchValue({ triggeredDuelCreated: true });
    }
  }

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
}
