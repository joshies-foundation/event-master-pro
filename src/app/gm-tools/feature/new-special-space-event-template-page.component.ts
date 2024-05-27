import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
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
  SpecialSpaceEventTemplateForm,
  specialSpaceEventTemplateFormFactory,
} from '../util/special-space-event-template-form';

@Component({
  selector: 'joshies-new-special-space-event-template-page',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    FormComponent,
    GameboardSpaceComponent,
    GameboardSpaceDescriptionPipe,
    HeaderLinkComponent,
    PageHeaderComponent,
    SharedModule,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="New Special Space Event Type" alwaysSmall>
      <joshies-header-link
        text="Back"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Form -->
    <joshies-form [form]="form" class="block mt-5" />

    <!-- Confirm Dialog -->
    <p-confirmDialog styleClass="mx-3" [key]="confirmDialogKey">
      <ng-template pTemplate="message">
        <div class="block">
          <p class="mt-0 mb-4">
            Are you sure you want to create the Special Space Event
            <strong>{{ specialSpaceEventTemplateName() }}</strong
            >?
          </p>

          <h4 class="mt-0 mb-2">
            {{ specialSpaceEventTemplateName() }}
          </h4>
          <p class="m-0 text-sm text-600">
            {{ specialSpaceEventTemplateFormValue().description }}
          </p>

          <p class="mt-4 text-primary font-italic text-sm">
            (Note: This event will not be available until it is added to a
            Special Space in the
            <strong>Manage Gameboard Space Types</strong> page)
          </p>
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewSpecialSpaceEventTemplatePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly gameboardService = inject(GameboardService);
  private readonly messageService = inject(MessageService);
  private readonly gameStateService = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly specialSpaceEventTemplates = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );

  readonly confirmDialogKey = 'create-special-space-event-template';

  readonly submitting = signal(false);

  readonly form: Form;
  readonly formGroup: ModelFormGroup<SpecialSpaceEventTemplateForm>;
  readonly specialSpaceEventTemplateFormValue: Signal<SpecialSpaceEventTemplateForm>;
  readonly specialSpaceEventTemplateName: Signal<string>;

  constructor() {
    ({
      specialSpaceEventTemplateForm: this.form,
      specialSpaceEventTemplateFormGroup: this.formGroup,
      specialSpaceEventTemplateFormValue:
        this.specialSpaceEventTemplateFormValue,
      specialSpaceEventTemplateName: this.specialSpaceEventTemplateName,
    } = specialSpaceEventTemplateFormFactory(
      async (gameboardSpace) =>
        this.gameboardService.createNewSpecialSpaceEventTemplate(
          gameboardSpace,
        ),
      (name) => `Create ${name}`,
      (name) => `Special Space Event "${name}" created`,
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
