import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../shared/data-access/user.service';
import { NotificationsService } from '../../../shared/data-access/notifications.service';
import { MessageService } from 'primeng/api';
import { Form, FormComponent } from '../../../shared/ui/form/form.component';
import {
  FormField,
  FormFieldType,
} from '../../../shared/ui/form-field/form-field.component';

@Component({
  selector: 'joshies-notifications-page',
  standalone: true,
  imports: [FormComponent],
  templateUrl: './notifications-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificationsPageComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationService = inject(NotificationsService);
  private readonly messageService = inject(MessageService);

  private readonly formGroup = this.formBuilder.nonNullable.group({
    recipient: ['', Validators.required],
    title: ['', Validators.required],
    body: ['', Validators.required],
  });

  readonly users = this.userService.allUsers;
  readonly sending = signal(false);

  readonly form: Form = {
    formGroup: this.formGroup,
    onSubmit: () => this.sendNotification(),
    disabled: this.sending,
    fields: computed((): FormField[] => [
      {
        label: 'Recipient',
        name: 'recipient',
        placeholder: 'Recipient',
        type: FormFieldType.Dropdown,
        options: this.users(),
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
        loading: this.sending(),
      },
    ]),
  };

  async sendNotification(): Promise<void> {
    this.sending.set(true);

    const { error } = await this.notificationService.sendNotification(
      this.formGroup.getRawValue(),
    );

    this.sending.set(false);

    if (error) {
      return this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Notification failed to send',
      });
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Notification Sent',
    });
  }
}
