import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import {
  ChaosSpaceEventTemplateForm,
  chaosSpaceEventTemplateFormFactory,
} from '../util/chaos-space-event-template-form';

@Component({
  selector: 'joshies-new-chaos-space-event-template-page',
  imports: [
    ConfirmDialogModule,
    FormComponent,
    HeaderLinkComponent,
    PageHeaderComponent,
    SharedModule,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="New Chaos Space Event Type" alwaysSmall>
      <joshies-header-link
        text="Back"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Form -->
    <joshies-form [form]="form" class="block mt-5 mb-8" />

    <!-- Confirm Dialog -->
    <p-confirmDialog styleClass="mx-3" [key]="confirmDialogKey">
      <ng-template pTemplate="message">
        <div class="block">
          <p class="mt-0 mb-4">
            Are you sure you want to create the Chaos Space Event
            <strong>{{ chaosSpaceEventTemplateName() }}</strong
            >?
          </p>

          <h4 class="mt-0 mb-2">
            {{ chaosSpaceEventTemplateName() }}
          </h4>
          <p class="m-0 text-sm text-600">
            {{ chaosSpaceEventTemplateFormValue().description }}
          </p>

          <p class="mt-4 text-primary font-italic text-sm">
            (Note: This event will not be available until it is added to a Chaos
            Space in the
            <strong>Manage Gameboard Space Types</strong> page)
          </p>
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewChaosSpaceEventTemplatePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly gameboardService = inject(GameboardService);
  private readonly messageService = inject(MessageService);
  private readonly gameStateService = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly chaosSpaceEventTemplates = toSignal(
    this.gameboardService.chaosSpaceEventTemplates$,
  );

  readonly confirmDialogKey = 'create-chaos-space-event-template';

  readonly submitting = signal(false);

  readonly form: Form;
  readonly formGroup: ModelFormGroup<ChaosSpaceEventTemplateForm>;
  readonly chaosSpaceEventTemplateFormValue: Signal<ChaosSpaceEventTemplateForm>;
  readonly chaosSpaceEventTemplateName: Signal<string>;

  constructor() {
    ({
      chaosSpaceEventTemplateForm: this.form,
      chaosSpaceEventTemplateFormGroup: this.formGroup,
      chaosSpaceEventTemplateFormValue: this.chaosSpaceEventTemplateFormValue,
      chaosSpaceEventTemplateName: this.chaosSpaceEventTemplateName,
    } = chaosSpaceEventTemplateFormFactory(
      async (gameboardSpace) =>
        this.gameboardService.createNewChaosSpaceEventTemplate(gameboardSpace),
      (name) => `Create ${name}`,
      (name) => `Chaos Space Event "${name}" created`,
      this.formBuilder,
      this.submitting,
      this.submitting,
      this.confirmDialogKey,
      this.gameStateService,
      this.router,
      this.activatedRoute,
      this.confirmationService,
      this.messageService,
    ));
  }
}
