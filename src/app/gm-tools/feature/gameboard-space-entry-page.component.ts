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
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { TableModule } from 'primeng/table';
import { trackById } from '../../shared/util/supabase-helpers';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../shared/data-access/session.service';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { GameStateService } from '../../shared/data-access/game-state.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { defined } from '../../shared/util/rxjs-helpers';
import { map, switchMap, take } from 'rxjs';
import {
  LocalStorageRecord,
  getRecordFromLocalStorage,
  saveRecordToLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'joshies-space-entry-page',
  standalone: true,
  template: `
    <joshies-page-header headerText="Space Entry" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-6">
        Select spaces for round {{ vm.roundNumber }} of
        {{ vm.numRounds }}
      </h4>
      <!-- Fixed layout allows indivdual scrolling of cells instead of whole table -->
      <p-table
        [value]="vm.players!"
        [defaultSortOrder]="-1"
        [formGroup]="vm.formGroup"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackById"
        [tableStyle]="{ 'table-layout': 'fixed' }"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Player</th>
            <th width="65%">Space</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.players!"
          let-player
        >
          <tr>
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
            <!-- Space Select -->
            <td>
              <div class="overflow-x-auto">
                <p-selectButton
                  [options]="vm.gameboardSpaces!"
                  optionLabel="icon_class"
                  optionValue="id"
                  [style]="{ 'text-wrap': 'nowrap' }"
                  [formControlName]="player.player_id"
                >
                  <ng-template let-gameboardSpace pTemplate>
                    <joshies-gameboard-space
                      [model]="gameboardSpace"
                      class="relative"
                    />
                  </ng-template>
                </p-selectButton>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-button
        label="Review Gameboard Spaces"
        styleClass="mt-4 w-full"
        (onClick)="reviewGameboardSpaces()"
        icon="pi pi-chevron-right"
        iconPos="right"
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
    RouterLink,
    DecimalPipe,
    GameboardSpaceComponent,
    GameboardSpaceDescriptionPipe,
    RadioButtonModule,
    StronglyTypedTableRowDirective,
    ReactiveFormsModule,
    SelectButtonModule,
  ],
})
export default class GameboardSpaceEntryPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);
  private readonly formBuilder = inject(FormBuilder);

  private readonly roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;

  protected readonly trackById = trackById;

  private readonly initialFormValue: Record<string, number> =
    getRecordFromLocalStorage(LocalStorageRecord.GameboardSpaceEntryFormValue);

  private readonly formGroup: Signal<FormGroup | undefined> = toSignal(
    this.playerService.players$.pipe(
      defined(),
      take(1), // take 1 so a player changing their name or picture doesn't reset the form
      map(
        (players): FormGroup =>
          this.formBuilder.nonNullable.group(
            players!.reduce(
              (prev, player) => ({
                ...prev,
                [player.player_id]: [
                  this.initialFormValue?.[player.player_id] ?? 0,
                  Validators.required,
                ],
              }),
              {},
            ),
          ),
      ),
    ),
  );

  private readonly formGroup$ = toObservable(this.formGroup);

  private readonly formValueChanges = toSignal(
    this.formGroup$.pipe(
      defined(),
      switchMap((formGroup) => formGroup.valueChanges),
    ),
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
        this.formValueChanges(),
      );
    }
  });

  reviewGameboardSpaces(): void {
    console.dir(
      getRecordFromLocalStorage(
        LocalStorageRecord.GameboardSpaceEntryFormValue,
      ),
    );
  }
}
