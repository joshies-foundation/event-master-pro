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
  ConfirmOverrideDialogComponent,
  ConfirmOverrideDialogModel,
  confirmOverrideDialogKey,
} from '../ui/confirm-override-dialog.component';
import {
  OverrideDefinitionTableComponent,
  OverrideDefinitionTableModel,
} from '../ui/override-definition-table.component';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'joshies-override-points-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    NgOptimizedImage,
    FormsModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    ConfirmOverrideDialogComponent,
    OverrideDefinitionTableComponent,
    CardComponent,
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
      <h2 class="flex align-items-center gap-3 mt-6 mb-5">
        <img
          [ngSrc]="player.avatar_url"
          alt=""
          height="48"
          width="48"
          class="border-circle surface-100"
        />
        {{ player.display_name }}
      </h2>

      <joshies-card padded>
        <!-- Override Type -->
        <p class="mt-0 mb-3">Override Type</p>
        <div class="flex flex-column gap-3 mb-5">
          @for (option of overrideTypeOptions; track option.addOrSubtractMode) {
            <label class="ml-2">
              <p-radioButton
                name="category"
                [value]="option.addOrSubtractMode"
                [(ngModel)]="inAddOrSubtractMode"
                styleClass="mr-1"
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

        <!-- Comment -->
        <label class="flex flex-column gap-2 mt-5">
          Reason for Override (Optional)
          <input pInputText [(ngModel)]="comment" />
        </label>
      </joshies-card>

      <!-- Submit Button -->
      <p-button
        label="Submit Override"
        styleClass="w-full mt-5"
        (onClick)="confirmSubmit()"
        [disabled]="submitButtonDisabled()"
        [loading]="submitting()"
      />

      <!-- Confirm Dialog -->
      <joshies-confirm-override-dialog [model]="confirmDialogModel()" />
    } @else if (player() === null) {
      <p class="mt-6">
        No player found in this session with ID
        <span class="font-bold">{{ playerId() }}</span>
      </p>
    } @else {
      <p-skeleton height="35rem" styleClass="mt-5" />
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
      acceptIcon: 'none',
      rejectIcon: 'none',
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
              )
            : this.playerService.overridePointsReplace(
                this.playerId(),
                this.userDefinedReplacementValue(),
                this.comment(),
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
