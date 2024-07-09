import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormFieldType } from '../../shared/ui/form-field/form-field.component';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { SkeletonModule } from 'primeng/skeleton';
import { SessionService } from '../../shared/data-access/session.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionModel, UserModel } from '../../shared/util/supabase-types';
import {
  PlayerService,
  PlayerWithUserInfo,
} from '../../shared/data-access/player.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

@Component({
  selector: 'joshies-create-session-page',
  standalone: true,
  imports: [
    FormComponent,
    SkeletonModule,
    PageHeaderComponent,
    HeaderLinkComponent,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Edit Session" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    @if (form(); as form) {
      <!-- Form -->
      <joshies-form [form]="form" class="block mt-5" />
    } @else {
      <!-- Loading Skeleton -->
      <div class="h-4rem"></div>
      <p-skeleton height="2.25rem" styleClass="mb-4" />
      <p-skeleton width="100%" height="19rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreateSessionPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly resolveData = input.required<{
    session: SessionModel;
    players: PlayerWithUserInfo[];
    allNonPlayerUsers: UserModel[];
  }>();

  readonly currentSession = computed(() => this.resolveData().session);
  readonly allNonPlayerUsers = computed(
    () => this.resolveData().allNonPlayerUsers,
  );

  readonly submitting = signal(false);

  readonly formGroup = computed(() =>
    this.formBuilder.nonNullable.group({
      sessionName: [this.currentSession().name, Validators.required],
      dateRange: [
        [
          new Date(this.currentSession().start_date),
          new Date(this.currentSession().end_date),
        ],
        Validators.required,
      ],
      startTime: [
        new Date(this.currentSession().start_date),
        Validators.required,
      ],
      newPlayerUserIds: [[] as UserModel['id'][]],
      numRounds: [this.currentSession().num_rounds, Validators.required],
    }),
  );

  readonly form = computed((): Form | undefined => ({
    formGroup: this.formGroup(),
    onSubmit: () => this.updateSession(),
    disabled: this.submitting,
    fields: computed(() => [
      {
        name: 'session-name',
        label: 'Session Name',
        placeholder: 'Session Name',
        type: FormFieldType.Text,
        control: this.formGroup().controls.sessionName,
      },
      {
        label: 'Date Range',
        name: 'date-range',
        placeholder: 'Date Range',
        type: FormFieldType.Calendar,
        selectionMode: 'range',
        touchUi: true,
        control: this.formGroup().controls.dateRange,
      },
      {
        label: 'Start Time (for countdown clock)',
        name: 'start-time',
        placeholder: 'Start Time',
        type: FormFieldType.Calendar,
        touchUi: true,
        showTime: true,
        timeOnly: true,
        control: this.formGroup().controls.startTime,
      },
      {
        label: 'Number of Rounds',
        name: 'num-rounds',
        placeholder: 'Number of Rounds',
        type: FormFieldType.Number,
        min: 1,
        max: 100,
        showButtons: true,
        control: this.formGroup().controls.numRounds,
      },
      {
        label: 'Add New Players',
        name: 'new-players',
        placeholder: 'New Players',
        type: FormFieldType.MultiSelect,
        options: this.allNonPlayerUsers(),
        optionLabel: 'real_name',
        optionValue: 'id',
        useChips: true,
        control: this.formGroup().controls.newPlayerUserIds,
      },
      {
        name: 'submit',
        label: 'Update Session',
        type: FormFieldType.Submit,
        position: 'full',
        loading: this.submitting(),
      },
    ]),
  }));

  private async updateSession(): Promise<void> {
    const formValue = this.formGroup().getRawValue();

    const { sessionName, numRounds, newPlayerUserIds, startTime } = formValue;

    const startDate = formValue.dateRange[0];
    const endDate = formValue.dateRange[1];

    // set the startDate's time to startTime
    startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0);

    // fix time zones
    startDate.setMinutes(
      startDate.getMinutes() - startDate.getTimezoneOffset(),
    );
    endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());

    confirmBackendAction({
      action: async () => {
        const updateSessionResponse = await this.sessionService.updateSession(
          this.currentSession().id,
          {
            name: sessionName,
            start_date: startDate as unknown as string, // submitting a Date object works
            end_date: endDate as unknown as string, // submitting a Date object works
            num_rounds: numRounds,
          },
        );

        let addPlayersResponse: PostgrestSingleResponse<unknown> | undefined;

        if (newPlayerUserIds.length) {
          addPlayersResponse = await this.playerService.addPlayers(
            this.currentSession().id,
            newPlayerUserIds,
          );
        }

        return addPlayersResponse?.error
          ? addPlayersResponse
          : updateSessionResponse;
      },
      confirmationMessageText: `Are you sure you want to update the session?`,
      successMessageText: 'Session updated',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '/',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }
}
