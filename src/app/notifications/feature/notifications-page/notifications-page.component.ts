import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../shared/data-access/user.service';
import { NotificationsService } from '../../../shared/data-access/notifications.service';
import { MessageService } from 'primeng/api';
import { Form, FormComponent } from '../../../shared/ui/form.component';
import {
  FormField,
  FormFieldType,
} from '../../../shared/ui/form-field/form-field.component';
import { withAllDefined } from '../../../shared/util/signal-helpers';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-notifications-page',
  standalone: true,
  templateUrl: './notifications-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormComponent,
    SkeletonModule,
    PageHeaderComponent,
  ],
})
export default class NotificationsPageComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationService = inject(NotificationsService);
  private readonly messageService = inject(MessageService);

  readonly allUsers = toSignal(this.userService.allUsers$);
  readonly sending = signal(false);

  readonly formGroup = this.formBuilder.nonNullable.group({
    recipient: ['', Validators.required],
    title: ['', Validators.required],
    body: ['', Validators.required],
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
            label: 'Recipient',
            name: 'recipient',
            placeholder: 'Recipient',
            type: FormFieldType.Dropdown,
            options: allUsers,
            optionLabel: 'display_name',
            optionValue: 'id',
            control: this.formGroup.controls.recipient,
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
            name: 'submit',
            label: 'Send Notification',
            type: FormFieldType.Submit,
            position: 'full',
            loading: this.sending(),
          },
        ],
      ),
    ),
  };

  sendNotification(): void {
    this.sending.set(true);
    this.notificationService
      .sendNotification(this.formGroup.getRawValue())
      .subscribe({
        complete: () => {
          this.sending.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Notification Sent',
          });
        },
        error: () => {
          this.sending.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Notification failed to send',
          });
        },
      });
  }
}
