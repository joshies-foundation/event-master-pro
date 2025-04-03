import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import {
  SpecialSpaceEventDetails,
  SpecialSpaceEventTemplateModel,
  SpecialSpaceEventType,
} from '../../shared/util/supabase-types';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormBuilder } from '@angular/forms';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  SpecialSpaceEventTemplateForm,
  specialSpaceEventTemplateFormFactory,
} from '../util/special-space-event-template-form';

@Component({
  selector: 'joshies-edit-special-space-event-template-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    ConfirmDialogModule,
    FormComponent,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <joshies-header-link
        text="Cancel"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (originalSpecialSpaceEventTemplate(); as originalGameboardSpace) {
      <!-- Form -->
      <joshies-form [form]="form!" class="block mt-8 mb-20" />

      <!-- Delete Button -->
      <p-button
        (onClick)="
          confirmDelete(
            specialSpaceEventTemplateId(),
            originalGameboardSpace.name
          )
        "
        [label]="deleteButtonText()"
        severity="danger"
        styleClass="w-full mt-12"
        [disabled]="deleteButtonDisabled()"
        [loading]="deleting()"
      />

      <!-- Confirm Submit Changes Dialog -->
      <p-confirmDialog styleClass="mx-4" [key]="confirmSubmitChangesDialogKey">
        <ng-template pTemplate="message">
          <div class="block">
            <p class="m-0">Are you sure you want submit these changes?</p>

            <!-- Before -->
            <h4 class="mt-6 mb-2">Before</h4>
            <div>
              <h4 class="mt-0 mb-2">{{ originalGameboardSpace.name }} Space</h4>
              <p class="text-sm text-surface-600 dark:text-surface-200">
                {{ originalGameboardSpace.description }}
              </p>
            </div>

            <!-- After -->
            <h4 class="mt-4 mb-2">After</h4>
            <div>
              <h4 class="mt-0 mb-2">
                {{ specialSpaceEventTemplateName() }}
              </h4>
              <p class="text-sm text-surface-600 dark:text-surface-200">
                {{ specialSpaceEventTemplateFormValue().description }}
              </p>
            </div>
          </div>
        </ng-template>
      </p-confirmDialog>
    } @else {
      <!-- Data Not Found Message -->
      <p class="mt-12">
        No special space event template found in this session with ID
        <span class="font-bold">{{ specialSpaceEventTemplateId() }}</span>
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default,
})
export default class EditGameboardSpaceTypePageComponent implements OnInit {
  private readonly gameboardService = inject(GameboardService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly gameStateService = inject(GameStateService);

  private readonly specialSpaceEventTemplates = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );

  readonly specialSpaceEventTemplateId: Signal<number> = input(0, {
    transform: numberAttribute,
  }); // route param

  readonly originalSpecialSpaceEventTemplate: Signal<SpecialSpaceEventTemplateModel | null> =
    input.required(); // route resolve data

  readonly confirmSubmitChangesDialogKey = 'edit-special-space-event-template';

  readonly deleting = signal(false);
  readonly submittingChange = signal(false);
  readonly performingAction = computed(
    () => this.deleting() || this.submittingChange(),
  );

  readonly headerText = computed(
    () => `Edit ${this.originalSpecialSpaceEventTemplate()?.name ?? ''}`,
  );

  readonly deleteButtonDisabled = computed(
    () =>
      this.performingAction() ||
      this.originalSpecialSpaceEventTemplate()?.type ===
        SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank,
  );

  readonly deleteButtonText = computed(
    () =>
      `${this.originalSpecialSpaceEventTemplate()?.type === SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank ? 'Cannot' : ''} Delete ${this.originalSpecialSpaceEventTemplate()?.name ?? ''}`,
  );

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
      async (specialSpaceEventTemplate) =>
        this.gameboardService.updateSpecialSpaceEventTemplate(
          this.specialSpaceEventTemplateId(),
          specialSpaceEventTemplate,
        ),
      () => `Submit Changes`,
      (name) => `${name} updated`,
      this.formBuilder,
      this.submittingChange,
      this.performingAction,
      this.confirmSubmitChangesDialogKey,
      this.gameStateService,
      this.router,
      this.activatedRoute,
      this.confirmationService,
      this.messageService,
    ));
  }

  // initialize form to original values
  ngOnInit(): void {
    const originalSpecialSpaceEventTemplate =
      this.originalSpecialSpaceEventTemplate();

    if (!originalSpecialSpaceEventTemplate) return;

    this.formGroup.setValue({
      name: originalSpecialSpaceEventTemplate.name,
      description: originalSpecialSpaceEventTemplate.description,
      type: originalSpecialSpaceEventTemplate.type,

      // don't assume the database JSON is valid
      lastPlacePoints:
        (
          originalSpecialSpaceEventTemplate.details as SpecialSpaceEventDetails<SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank>
        )?.lastPlacePoints ?? 24,
      pointsLabelPlural:
        (
          originalSpecialSpaceEventTemplate.details as SpecialSpaceEventDetails<SpecialSpaceEventType.PlayerGainsPointsBasedOnGameScore>
        )?.pointsLabelPlural ?? '',
      pointsLabelSingular:
        (
          originalSpecialSpaceEventTemplate.details as SpecialSpaceEventDetails<SpecialSpaceEventType.PlayerGainsPointsBasedOnGameScore>
        )?.pointsLabelSingular ?? '',
      sessionPointsPerGamePoint:
        (
          originalSpecialSpaceEventTemplate.details as SpecialSpaceEventDetails<SpecialSpaceEventType.PlayerGainsPointsBasedOnGameScore>
        )?.sessionPointsPerGamePoint ?? 1,
    });
  }

  confirmDelete(
    specialSpaceEventTemplateId: number,
    specialSpaceEventTemplateName: string,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.deleteSpecialSpaceEventTemplate(
          specialSpaceEventTemplateId,
        ),
      confirmationMessageText: `Are you sure you want to delete ${specialSpaceEventTemplateName}?`,
      successMessageText: `Deleted ${specialSpaceEventTemplateName}`,
      successNavigation: '..',
      submittingSignal: this.deleting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }
}
