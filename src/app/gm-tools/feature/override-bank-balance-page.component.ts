import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import {
  ConfirmBankBalanceOverrideDialogComponent,
  confirmOverrideDialogKey,
} from '../ui/confirm-bank-balance-override-dialog.component';
import {
  OverrideDefinitionTableComponent,
  OverrideDefinitionTableModel,
} from '../ui/override-definition-table.component';
import { CardComponent } from '../../shared/ui/card.component';
import { SessionService } from '../../shared/data-access/session.service';
import { GameStateService } from '../../shared/data-access/game-state.service';

@Component({
  selector: 'joshies-override-bank-balance-page',
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
    ConfirmBankBalanceOverrideDialogComponent,
    OverrideDefinitionTableComponent,
    CardComponent,
  ],
  template: `
    <joshies-page-header headerText="Override Bank Balance" alwaysSmall>
      <joshies-header-link
        text="Cancel"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (oldBankBalance() !== undefined; as player) {
      <joshies-card padded class="mt-5">
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
          [model]="overrideDefinitionTableModel()"
          [(userDefinedChangeValue)]="userDefinedChangeValue"
          [(userDefinedReplacementValue)]="userDefinedReplacementValue"
        />
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
      <joshies-confirm-bank-balance-override-dialog
        [model]="confirmDialogModel()"
      />
    } @else {
      <p-skeleton height="35rem" styleClass="mt-5" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverridePointsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly sessionId = this.gameStateService.sessionId;

  readonly oldBankBalance = computed(
    () => this.sessionService.session()?.bank_balance ?? 0,
  );

  // form values
  readonly inAddOrSubtractMode = signal(true);
  readonly userDefinedChangeValue = signal(0);
  readonly userDefinedReplacementValue = signal(this.oldBankBalance() ?? 0);

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
      label: 'Replace Bank Balance Entirely',
      addOrSubtractMode: false,
    },
  ];

  private readonly changeValueDerivedFromReplacementValue = computed(
    () => this.userDefinedReplacementValue() - this.oldBankBalance(),
  );

  readonly changeValue = computed(() =>
    this.inAddOrSubtractMode()
      ? this.userDefinedChangeValue()
      : this.changeValueDerivedFromReplacementValue(),
  );

  readonly newBankBalance = computed(
    () => this.oldBankBalance() + this.changeValue(),
  );

  readonly submitButtonDisabled = computed(() =>
    this.submitting() || this.inAddOrSubtractMode()
      ? this.userDefinedChangeValue() === 0
      : this.userDefinedReplacementValue() === this.oldBankBalance(),
  );

  readonly overrideDefinitionTableModel = computed(
    (): OverrideDefinitionTableModel => ({
      inAddOrSubtractMode: this.inAddOrSubtractMode(),
      oldScore: this.oldBankBalance(),
      changeValue: this.changeValue(),
      newScore: this.newBankBalance(),
      inputDisabled: this.submitting(),
    }),
  );

  readonly confirmDialogModel = this.overrideDefinitionTableModel;

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
            ? this.sessionService.overrideBankBalanceAdd(
                this.sessionId()!,
                this.userDefinedChangeValue(),
              )
            : this.sessionService.overrideBankBalanceReplace(
                this.sessionId()!,
                this.userDefinedReplacementValue(),
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
