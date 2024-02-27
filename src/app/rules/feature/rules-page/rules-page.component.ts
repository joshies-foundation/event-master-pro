import {
  ChangeDetectionStrategy,
  Component,
  computed,
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

@Component({
  selector: 'joshies-rules-page',
  standalone: true,
  templateUrl: './rules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonModule, EditorModule, FormsModule, FormComponent],
})
export default class RulesPageComponent {
  private readonly rulesService = inject(RulesService);
  private readonly sessionService = inject(SessionService);
  private readonly formBuilder = inject(FormBuilder);

  readonly rules = this.rulesService.rules;

  readonly savingRules = signal(false);

  readonly formGroup = this.formBuilder.nonNullable.group({
    rules: ['', Validators.required],
  });

  readonly activeSessionId = computed(() => this.sessionService.session()!.id);

  readonly form: Form = {
    formGroup: this.formGroup,
    onSubmit: () => this.saveRules(),
    disabled: this.savingRules,
    fields: computed(() => [
      {
        name: 'rules',
        label: '',
        height: '510px',
        placeholder: 'Enter Rules Here',
        type: FormFieldType.Editor,
        control: this.formGroup.controls.rules,
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

  text = '';

  private async saveRules(): Promise<void> {
    this.savingRules.set(true);

    const activeSessionId = this.sessionService.session()!.id;
    const rulesHtml = this.formGroup.getRawValue().rules;

    await this.rulesService.saveRules(activeSessionId, rulesHtml);

    this.savingRules.set(false);
  }
}
