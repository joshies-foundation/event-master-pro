import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../../shared/data-access/user.service';
import { DropdownModule } from 'primeng/dropdown';
import { JsonPipe, KeyValuePipe, LowerCasePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NotificationsService } from '../../../shared/data-access/notifications.service';
import { MessageService } from 'primeng/api';
import { Form, FormComponent } from '../../../shared/ui/form/form.component';
import { FormFieldType } from '../../../shared/ui/form-field/form-field.component';
import { Table } from '../../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-notifications-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    KeyValuePipe,
    LowerCasePipe,
    ButtonModule,
    FormComponent,
    JsonPipe,
  ],
  templateUrl: './notifications-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificationsPageComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationService = inject(NotificationsService);
  private readonly messageService = inject(MessageService);
  private readonly supabase = inject(SupabaseClient);

  readonly users = this.userService.allUsers;
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
    fields: computed(() => [
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
        position: 'full',
        loading: this.sending(),
      },
    ]),
  };

  //   const dbTable = Table.UserNotificationsSubscription;
  //   const dbColumn = 'notifications_subscription';
  //   const whereColumn = 'user_id';
  //
  //   console.log(
  //   'Grabbing',
  //   dbColumn,
  //   'from table',
  //   dbTable,
  //   'where',
  //   whereColumn,
  //   '=',
  //   recipient,
  // );

  readonly data = toSignal(
    from(
      this.supabase
        .from(Table.UserNotificationsSubscription)
        .select('notifications_subscription')
        .eq('user_id', 'be62a737-ed9f-4e88-8e74-ee8310131818'),
    ),
  );

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
