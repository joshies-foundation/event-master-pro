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
import { EditorModule } from 'primeng/editor';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { Form, FormComponent } from '../../../shared/ui/form/form.component';
import { FormFieldType } from '../../../shared/ui/form-field/form-field.component';
import { SessionService } from '../../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FooterService } from '../../../shared/data-access/footer.service';
import { NgClass } from '@angular/common';
import { pagePaddingXCssClass } from '../../../shared/util/css-helpers';
import { PlayerService } from '../../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';

@Component({
  selector: 'joshies-rules-page',
  standalone: true,
  templateUrl: './rules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SkeletonModule,
    EditorModule,
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
      rules: [this.rules() ?? '', Validators.required],
    }),
  );

  private readonly form: Form = {
    formGroup: this.formGroup(),
    onSubmit: () => this.saveRules(),
    disabled: this.savingRules,
    fields: computed(() => [
      {
        name: 'rules',
        label: '',
        height: '510px',
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
  };

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
      form: this.form,
      formFields: this.form.fields,
    }),
  );

  private async saveRules(): Promise<void> {
    this.savingRules.set(true);

    const activeSessionId = this.sessionService.session()!.id;
    const rulesHtml = this.formGroup().getRawValue().rules;

    await this.rulesService.saveRules(activeSessionId, rulesHtml ?? '');

    this.savingRules.set(false);
    this.disableEditor();
  }

  enableEditor(): void {
    this.editMode.set(true);
  }

  disableEditor(): void {
    this.editMode.set(false);
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
      accept: () => this.disableEditor(),
    });
  }
}
