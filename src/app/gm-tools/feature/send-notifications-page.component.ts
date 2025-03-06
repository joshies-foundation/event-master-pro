import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/data-access/user.service';
import { NotificationsService } from '../../shared/data-access/notifications.service';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Form, FormComponent } from '../../shared/ui/form.component';
import {
  FormField,
  FormFieldType,
} from '../../shared/ui/form-field/form-field.component';
import { withAllDefined } from '../../shared/util/signal-helpers';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { CardComponent } from '../../shared/ui/card.component';
import { UserModel } from '../../shared/util/supabase-types';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';

@Component({
  selector: 'joshies-send-notifications-page',
  imports: [
    ReactiveFormsModule,
    FormComponent,
    SkeletonModule,
    PageHeaderComponent,
    CardComponent,
    HeaderLinkComponent,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Send Notifications" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (form.fields()) {
      <!-- Form -->
      <joshies-card padded class="mt-5">
        <joshies-form [form]="form" />
      </joshies-card>
    } @else {
      <!-- Loading Skeleton -->
      <div class="h-4rem"></div>
      <p-skeleton height="2.25rem" styleClass="mb-4" />
      <p-skeleton width="100%" height="19rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SendNotificationsPageComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationService = inject(NotificationsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allUsers = toSignal(this.userService.allUsers$);
  readonly sending = signal(false);

  readonly formGroup = this.formBuilder.nonNullable.group({
    recipientUserIds: [[] as UserModel['id'][], Validators.required],
    title: [
      '📣 Message from the GM',
      [Validators.required, Validators.maxLength(120)],
    ],
    body: ['', [Validators.required, Validators.maxLength(120)]],
    openUrl: [''],
  });

  readonly form: Form = {
    formGroup: this.formGroup,
    onSubmit: () => this.sendNotification(),
    disabled: this.sending,
    fields: computed(() =>
      withAllDefined(
        { allUsers: this.allUsers() },
        ({ allUsers }): FormField[] => [
          {
            label: 'Recipients',
            name: 'recipients',
            placeholder: 'Recipients',
            type: FormFieldType.MultiSelect,
            options: allUsers,
            optionLabel: 'real_name',
            optionValue: 'id',
            control: this.formGroup.controls.recipientUserIds,
          },
          {
            name: 'title',
            label: 'Title',
            placeholder: 'Title',
            type: FormFieldType.Text,
            control: this.formGroup.controls.title,
          },
          {
            name: 'body',
            label: 'Body',
            placeholder: 'Body',
            type: FormFieldType.Text,
            control: this.formGroup.controls.body,
          },
          {
            name: 'open-url',
            label: 'Open URL on Tap (Optional)',
            placeholder: 'eg: /betting',
            type: FormFieldType.Text,
            control: this.formGroup.controls.openUrl,
          },
          {
            name: 'submit',
            label: 'Send Notification',
            type: FormFieldType.Submit,
            position: 'full',
            icon: PrimeIcons.SEND,
            loading: this.sending(),
          },
        ],
      ),
    ),
  };

  sendNotification(): void {
    confirmBackendAction({
      action: async () =>
        this.notificationService.sendPushNotificationToUsers(
          this.formGroup.getRawValue(),
        ),
      confirmationMessageText:
        'Are you sure you want to send this notification?',
      successMessageText: 'Notification sent',
      submittingSignal: this.sending,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }
}
