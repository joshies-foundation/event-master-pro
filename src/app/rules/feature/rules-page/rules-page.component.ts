import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RulesService } from '../../data-access/rules.service';
import { SkeletonModule } from 'primeng/skeleton';
import {
  FormBuilder,
  FormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Form, FormComponent } from '../../../shared/ui/form.component';
import {
  FormField,
  FormFieldType,
} from '../../../shared/ui/form-field/form-field.component';
import { SessionService } from '../../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FooterService } from '../../../shared/data-access/footer.service';
import { NgClass } from '@angular/common';
import { pagePaddingXCssClass } from '../../../shared/util/css-helpers';
import { PlayerService } from '../../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';

function valueIsNot(invalidValue: string): ValidatorFn {
  return (control) =>
    control.value === invalidValue
      ? { invalidValue: `Value is invalid` }
      : null;
}

@Component({
  selector: 'joshies-rules-page',
  standalone: true,
  templateUrl: './rules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SkeletonModule,
    FormsModule,
    FormComponent,
    ButtonModule,
    ConfirmDialogModule,
    NgClass,
  ],
})
export default class RulesPageComponent {
  private readonly rulesService = inject(RulesService);
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly playerService = inject(PlayerService);
  private readonly footerService = inject(FooterService);
  private readonly formBuilder = inject(FormBuilder);

  private readonly rules = this.rulesService.rules;

  private readonly editMode = signal(false);
  private readonly savingRules = signal(false);

  private readonly formGroup = computed(() =>
    this.formBuilder.nonNullable.group({
      rules: [
        this.rules() ?? '',
        [Validators.required, valueIsNot(this.rules() ?? '')],
      ],
    }),
  );

  private readonly form = computed(
    (): Form => ({
      formGroup: this.formGroup(),
      onSubmit: () => this.saveRules(),
      disabled: this.savingRules,
      fields: computed((): FormField[] => [
        {
          name: 'rules',
          label: '',
          placeholder: 'Enter Rules Here',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.rules,
        },
        {
          name: 'submit',
          label: 'Save Rules',
          type: FormFieldType.Submit,
          position: 'full',
          loading: this.savingRules(),
        },
      ]),
    }),
  );

  private readonly disableFooterEffect = effect(
    () =>
      this.editMode()
        ? this.footerService.enableFooter()
        : this.footerService.disableFooter(),
    { allowSignalWrites: true },
  );

  readonly pagePaddingXCssClass = pagePaddingXCssClass;

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      editMode: this.editMode(),
      userIsGameMaster: this.playerService.userIsGameMaster(),
      rules: this.rules(),
      form: this.form(),
    }),
  );

  private async saveRules(): Promise<void> {
    this.savingRules.set(true);

    const activeSessionId = this.sessionService.session()!.id;
    const rulesHtml = this.formGroup().getRawValue().rules;

    await this.rulesService.saveRules(activeSessionId, rulesHtml ?? '');

    this.savingRules.set(false);
    this.cancelChanges();
  }

  enterEditMode(): void {
    this.editMode.set(true);
  }

  cancelChanges(): void {
    this.editMode.set(false);
    this.formGroup().reset();
  }

  confirmCancel(): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want close the editor?  Any unsaved changes will be lost.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.cancelChanges(),
    });
  }
}
