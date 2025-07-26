import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { withAllDefined } from '../../shared/util/signal-helpers';
import { SkeletonModule } from 'primeng/skeleton';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { defined } from '../../shared/util/rxjs-helpers';
import { take } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import {
  confirmOverrideDialogKey,
  ConfirmOverrideDialogModel,
  ConfirmScoreOverrideDialogComponent,
} from '../ui/confirm-score-override-dialog.component';
import {
  OverrideDefinitionTableComponent,
  OverrideDefinitionTableModel,
} from '../ui/override-definition-table.component';
import { CardComponent } from '../../shared/ui/card.component';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'joshies-override-points-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    NgOptimizedImage,
    FormsModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    ConfirmScoreOverrideDialogComponent,
    OverrideDefinitionTableComponent,
    CardComponent,
    CheckboxModule,
  ],
  template: `
    <joshies-page-header headerText="Override Points" alwaysSmall>
      <joshies-header-link
        text="Cancel"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (player(); as player) {
      <!-- Player Header -->
      <h2 class="mt-12 mb-8 flex items-center gap-4 font-bold">
        <img
          [ngSrc]="player.avatar_url"
          alt=""
          height="48"
          width="48"
          class="size-12 rounded-full bg-neutral-100"
        />
        <div>
          <p>{{ player.display_name }}</p>
          <p class="m-0 text-base font-normal text-neutral-500">
            {{ player.real_name }}
          </p>
        </div>
      </h2>

      <joshies-card padded>
        <!-- Override Type -->
        <p class="mb-4">Override Type</p>
        <div class="mb-8 flex flex-col gap-4">
          @for (option of overrideTypeOptions; track option.addOrSubtractMode) {
            <label class="ml-2">
              <p-radio-button
                name="category"
                [value]="option.addOrSubtractMode"
                [(ngModel)]="inAddOrSubtractMode"
                class="mr-1"
                [disabled]="submitting()"
              />
              {{ option.label }}
            </label>
          }
        </div>

        <!-- Table -->
        <joshies-override-definition-table
          [model]="overrideDefinitionTableMode()"
          [(userDefinedChangeValue)]="userDefinedChangeValue"
          [(userDefinedReplacementValue)]="userDefinedReplacementValue"
        />

        @if (changeValue() < 0) {
          <label class="mt-6 flex items-center gap-2">
            <p-checkbox
              [binary]="true"
              [(ngModel)]="addLostPointsToBankBalance"
            />
            Add lost points to Bank Balance
          </label>
        }

        <!-- Comment -->
        <label class="mt-6 flex flex-col gap-2">
          Reason for Override (Optional)
          <input pInputText [(ngModel)]="comment" />
        </label>
      </joshies-card>

      <!-- Submit Button -->
      <p-button
        label="Submit Override"
        styleClass="w-full mt-8"
        (onClick)="confirmSubmit()"
        [disabled]="submitButtonDisabled()"
        [loading]="submitting()"
      />

      <!-- Confirm Dialog -->
      <joshies-confirm-score-override-dialog [model]="confirmDialogModel()" />
    } @else if (player() === null) {
      <p class="mt-12">
        No player found in this session with ID
        <span class="font-bold">{{ playerId() }}</span>
      </p>
    } @else {
      <p-skeleton height="35rem" class="mt-8" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverridePointsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly playerId = input(0, { transform: numberAttribute }); // route param

  readonly player = computed(() =>
    withAllDefined(
      { players: this.playerService.players() },
      ({ players }) =>
        players?.find((player) => player.player_id === this.playerId()) ?? null,
    ),
  );

  readonly oldScore = computed(() => this.player()?.score ?? 0);

  // form values
  readonly inAddOrSubtractMode = signal(true);
  readonly userDefinedChangeValue = signal(0);
  readonly userDefinedReplacementValue = signal(0);
  readonly comment = signal('');
  readonly addLostPointsToBankBalance = signal(true);

  readonly submitting = signal(false);

  readonly overrideTypeOptions: {
    label: string;
    addOrSubtractMode: boolean;
  }[] = [
    {
      label: 'Add or Subtract Points',
      addOrSubtractMode: true,
    },
    {
      label: 'Replace Score Entirely',
      addOrSubtractMode: false,
    },
  ];

  private readonly changeValueDerivedFromReplacementValue = computed(
    () => this.userDefinedReplacementValue() - this.oldScore(),
  );

  readonly changeValue = computed(() =>
    this.inAddOrSubtractMode()
      ? this.userDefinedChangeValue()
      : this.changeValueDerivedFromReplacementValue(),
  );

  readonly newScore = computed(() => this.oldScore() + this.changeValue());

  readonly submitButtonDisabled = computed(() =>
    this.submitting() || this.inAddOrSubtractMode()
      ? this.userDefinedChangeValue() === 0
      : this.userDefinedReplacementValue() === this.oldScore(),
  );

  readonly overrideDefinitionTableMode = computed(
    (): OverrideDefinitionTableModel => ({
      inAddOrSubtractMode: this.inAddOrSubtractMode(),
      oldScore: this.oldScore(),
      changeValue: this.changeValue(),
      newScore: this.newScore(),
      inputDisabled: this.submitting(),
    }),
  );

  readonly confirmDialogModel = computed(
    (): ConfirmOverrideDialogModel => ({
      ...this.overrideDefinitionTableMode(),
      player: this.player()!,
      comment: this.comment(),
    }),
  );

  constructor() {
    // initialize replacement value to be the old score
    toObservable(this.player)
      .pipe(
        defined(),
        take(1), // take 1 so a user changing their name or avatar does not reset the form
        takeUntilDestroyed(),
      )
      .subscribe((player) =>
        this.userDefinedReplacementValue.set(player.score),
      );
  }

  confirmSubmit(): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      // dialog content defined in template
      rejectButtonStyleClass: 'p-button-text',
      key: confirmOverrideDialogKey,
      accept: async () => {
        this.submitting.set(true);

        const { error } = await showMessageOnError(
          this.inAddOrSubtractMode()
            ? this.playerService.overridePointsAdd(
                this.playerId(),
                this.userDefinedChangeValue(),
                this.comment(),
                this.addLostPointsToBankBalance(),
              )
            : this.playerService.overridePointsReplace(
                this.playerId(),
                this.userDefinedReplacementValue(),
                this.comment(),
                this.addLostPointsToBankBalance(),
              ),
          this.messageService,
        );

        if (error) {
          this.submitting.set(false);
          return;
        }

        showSuccessMessage('Score saved successfully', this.messageService);
        this.router.navigate(['..'], { relativeTo: this.activatedRoute });
      },
    });
  }
}
