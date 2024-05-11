import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { NgOptimizedImage } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../shared/data-access/session.service';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { defined } from '../../shared/util/rxjs-helpers';
import { Observable, map, shareReplay, switchMap, take } from 'rxjs';
import {
  LocalStorageRecord,
  getRecordFromLocalStorage,
  saveRecordToLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { SelectButtonModule } from 'primeng/selectbutton';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { InputNumberModule } from 'primeng/inputnumber';

interface GameboardSpaceEntryFormKeys {
  distanceTraveled: number;
  gameboardSpaceId: number;
}
export type GameboardSpaceEntryFormModel = Record<
  number,
  GameboardSpaceEntryFormKeys
>;

@Component({
  selector: 'joshies-space-entry-page',
  standalone: true,
  template: `
    <joshies-page-header headerText="Move Entry" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-6">
        Enter each player's distance traveled and space for round
        {{ vm.roundNumber }} of
        {{ vm.numRounds }}
      </h4>
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
        <ng-template pTemplate="header">
          <tr>
            <th class="w-8rem p-0"></th>
            <th class="p-0"></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.players!"
          let-player
        >
          <tr [formGroupName]="player.player_id">
            <!-- Player -->
            <td>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="border-circle surface-100"
                />
                {{ player.display_name }}
              </div>
            </td>
            <!-- Distance -->
            <td class="text-right">
              <p-inputNumber
                formControlName="distanceTraveled"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputStyleClass="w-full font-semibold text-right"
                placeholder="Distance"
              />
              <p-selectButton
                [options]="vm.gameboardSpaces!"
                optionLabel="icon_class"
                optionValue="id"
                formControlName="gameboardSpaceId"
                [style]="{ 'text-wrap': 'nowrap' }"
                styleClass="overflow-x-auto mt-2"
                [allowEmpty]="false"
              >
                <ng-template let-gameboardSpace pTemplate>
                  <joshies-gameboard-space
                    [model]="gameboardSpace"
                    class="relative"
                  />
                </ng-template>
              </p-selectButton>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-button
        label="Review Moves"
        styleClass="mt-4 w-full"
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
  ],
})
export default class GameboardSpaceEntryPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);
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

  private readonly formValueChanges: Signal<
    Partial<GameboardSpaceEntryFormModel> | undefined
  > = toSignal(
    this.formGroup$.pipe(switchMap((formGroup) => formGroup.valueChanges)),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      roundNumber: this.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      formGroup: this.formGroup(),
      players: this.playerService.players(),
      gameboardSpaces: this.sessionService.gameboardSpaces(),
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
}
