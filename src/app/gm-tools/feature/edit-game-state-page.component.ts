import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FormField,
  FormFieldType,
} from '../../shared/ui/form-field/form-field.component';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../shared/data-access/player.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { RoundPhase, SessionStatus } from '../../shared/util/supabase-helpers';
import { EditGameStateResolverData } from '../data-access/edit-game-state.resolver';
import { GameStateService } from '../../shared/data-access/game-state.service';

@Component({
  selector: 'joshies-edit-game-state-page',
  imports: [
    FormComponent,
    SkeletonModule,
    PageHeaderComponent,
    HeaderLinkComponent,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Override Game State" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    @if (form(); as form) {
      <!-- Form -->
      <joshies-form [form]="form" class="mt-8 mb-20 block" />
    } @else {
      <!-- Loading Skeleton -->
      <div class="h-16"></div>
      <p-skeleton height="2.25rem" styleClass="mb-6" />
      <p-skeleton width="100%" height="19rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreateSessionPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly gameStateService = inject(GameStateService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly resolveData = input.required<EditGameStateResolverData>();

  readonly submitting = signal(false);

  readonly formGroup = computed(() =>
    this.formBuilder.nonNullable.group({
      session_id: [
        this.resolveData().gameState.session_id,
        Validators.required,
      ],
      session_status: [
        this.resolveData().gameState.session_status,
        Validators.required,
      ],
      round_number: [
        this.resolveData().gameState.round_number,
        Validators.required,
      ],
      round_phase: [
        this.resolveData().gameState.round_phase,
        Validators.required,
      ],
    }),
  );

  readonly form = computed((): Form | undefined => ({
    formGroup: this.formGroup(),
    onSubmit: () => this.updateGameState(),
    disabled: this.submitting,
    fields: computed((): FormField[] => [
      {
        name: 'session-id',
        label: 'Active Session',
        placeholder: 'Active Session',
        type: FormFieldType.Dropdown,
        control: this.formGroup().controls.session_id,
        optionLabel: 'name',
        optionValue: 'id',
        options: this.resolveData().allSessionsResponse.data ?? [],
      },
      {
        name: 'session-status',
        label: 'Session Status',
        placeholder: 'Session Status',
        type: FormFieldType.Dropdown,
        control: this.formGroup().controls.session_status,
        optionLabel: 'value',
        optionValue: 'value',
        options: Object.values(SessionStatus).map((status) => ({
          value: status,
        })),
      },
      {
        name: 'round-number',
        label: 'Round Number',
        placeholder: 'Round Number',
        type: FormFieldType.Number,
        control: this.formGroup().controls.round_number,
      },
      {
        name: 'round-phase',
        label: 'Round Phase',
        placeholder: 'Round Phase',
        type: FormFieldType.Dropdown,
        control: this.formGroup().controls.round_phase,
        optionLabel: 'value',
        optionValue: 'value',
        options: Object.values(RoundPhase).map((status) => ({
          value: status,
        })),
      },
      {
        name: 'submit',
        label: 'Update Game State',
        type: FormFieldType.Submit,
        position: 'full',
        loading: this.submitting(),
      },
    ]),
  }));

  private updateGameState(): void {
    confirmBackendAction({
      action: async () =>
        this.gameStateService.updateGameState(this.formGroup().getRawValue()),
      confirmationMessageText: `Are you sure you want to update the Game State?`,
      successMessageText: 'Game State updated',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }
}
