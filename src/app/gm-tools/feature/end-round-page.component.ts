import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlayerService } from '../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { SessionService } from '../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { defined } from '../../shared/util/rxjs-helpers';
import { map, switchMap, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LocalStorageRecord,
  getRecordFromLocalStorage,
  saveRecordToLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { trackById } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';

@Component({
  selector: 'joshies-end-round-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    TableModule,
    InputNumberModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    ButtonModule,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="End Round" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-6">
        Tally score changes for round {{ vm.roundNumber }} of {{ vm.numRounds }}
      </h4>

      <p-table
        [value]="vm.players!"
        [formGroup]="vm.formGroup"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackById"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Player</th>
            <th class="text-right">Score Change</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.players!"
          let-player
        >
          <tr>
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
            <td class="text-right">
              <p-inputNumber
                #input
                [formControlName]="player.player_id"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                [inputStyleClass]="
                  'w-full font-semibold text-right ' +
                  ((input.value ?? 0) > 0
                    ? 'text-green'
                    : (input.value ?? 0) < 0
                      ? 'text-red'
                      : '')
                "
                [prefix]="(input.value ?? 0) > 0 ? '+' : ''"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-button
        label="Review Score Changes"
        styleClass="mt-4 w-full"
        (onClick)="reviewScoreChanges()"
        icon="pi pi-chevron-right"
        iconPos="right"
      />
    } @else {
      <p-skeleton height="30rem" styleClass="mt-6" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EndRoundPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly trackById = trackById;

  private readonly initialFormValue: Record<string, number> =
    getRecordFromLocalStorage(LocalStorageRecord.RoundScoreFormValue);

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

  private readonly roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;

  private readonly saveFormUpdatesToLocalStorage = effect(() => {
    if (this.formValueChanges()) {
      saveRecordToLocalStorage(
        LocalStorageRecord.RoundScoreFormValue,
        this.formValueChanges(),
      );
    }
  });

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      roundNumber: this.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      formGroup: this.formGroup(),
      players: this.playerService.players(),
    }),
  );

  reviewScoreChanges(): void {
    this.router.navigate(['review'], {
      relativeTo: this.activatedRoute,
    });
  }
}
