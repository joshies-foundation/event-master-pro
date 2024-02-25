import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FormField,
  FormFieldType,
} from '../../../shared/ui/form-field/form-field.component';
import { Form, FormComponent } from '../../../shared/ui/form/form.component';
import { withAllDefined } from '../../../shared/util/signal-helpers';
import { UserService } from '../../../shared/data-access/user.service';
import { SkeletonModule } from 'primeng/skeleton';
import { SessionService } from '../../../shared/data-access/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'joshies-create-session-page',
  standalone: true,
  imports: [FormComponent, SkeletonModule],
  templateUrl: './create-session-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreateSessionPageComponent {
  private readonly userService = inject(UserService);
  private readonly sessionService = inject(SessionService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly allUsers = this.userService.allUsers;
  readonly creatingSession = signal(false);

  readonly formGroup = this.formBuilder.nonNullable.group({
    sessionName: ['', Validators.required],
    dateRange: [
      [new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)],
      Validators.required,
    ],
    players: [[] as string[], Validators.required],
  });

  readonly form: Form = {
    formGroup: this.formGroup,
    onSubmit: () => this.createSession(),
    disabled: this.creatingSession,
    fields: computed(() =>
      withAllDefined(
        { allUsers: this.allUsers() },
        ({ allUsers }): FormField[] => [
          {
            name: 'session-name',
            label: 'Session Name',
            placeholder: 'Session Name',
            type: FormFieldType.Text,
            control: this.formGroup.controls.sessionName,
          },
          {
            label: 'Date Range',
            name: 'date-range',
            placeholder: 'Date Range',
            type: FormFieldType.Calendar,
            minDate: new Date(),
            maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            selectionMode: 'range',
            control: this.formGroup.controls.dateRange,
          },
          {
            label: 'Players',
            name: 'players',
            placeholder: 'Players',
            type: FormFieldType.MultiSelect,
            options: allUsers,
            optionLabel: 'display_name',
            optionValue: 'id',
            useChips: true,
            control: this.formGroup.controls.players,
          },
          {
            name: 'submit',
            label: 'Create Session',
            type: FormFieldType.Submit,
            position: 'full',
            loading: this.creatingSession(),
          },
        ],
      ),
    ),
  };

  private async createSession(): Promise<void> {
    this.creatingSession.set(true);

    const sessionName = this.formGroup.getRawValue().sessionName;
    const gameMasterUserId = this.userService.user()!.id;
    const startDate = this.formGroup.getRawValue().dateRange[0];
    const endDate = this.formGroup.getRawValue().dateRange[0];
    const playerUserIds = this.formGroup.getRawValue().players;

    await this.sessionService.createSession(
      sessionName,
      gameMasterUserId,
      startDate,
      endDate,
      playerUserIds,
    );

    this.router.navigateByUrl('/');
  }
}
