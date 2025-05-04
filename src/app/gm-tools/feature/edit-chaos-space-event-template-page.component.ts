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
  ChaosSpaceEventDetails,
  ChaosSpaceEventTemplateModel,
  ChaosSpaceEventType,
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
  ChaosSpaceEventTemplateForm,
  chaosSpaceEventTemplateFormFactory,
} from '../util/chaos-space-event-template-form';

@Component({
  selector: 'joshies-edit-chaos-space-event-template-page',
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

    @if (originalChaosSpaceEventTemplate(); as originalGameboardSpace) {
      <!-- Form -->
      <joshies-form [form]="form!" class="mt-8 mb-20 block" />

      <!-- Delete Button -->
      <p-button
        (onClick)="
          confirmDelete(
            chaosSpaceEventTemplateId(),
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
        <ng-template #message>
          <div class="block">
            <p>Are you sure you want submit these changes?</p>

            <!-- Before -->
            <h4 class="mt-6 mb-2 font-bold">Before</h4>
            <div>
              <h4 class="mb-2 font-bold">
                {{ originalGameboardSpace.name }} Space
              </h4>
              <p class="my-4 text-sm text-neutral-600">
                {{ originalGameboardSpace.description }}
              </p>
            </div>

            <!-- After -->
            <h4 class="mt-4 mb-2 font-bold">After</h4>
            <div>
              <h4 class="mb-2 font-bold">
                {{ chaosSpaceEventTemplateName() }}
              </h4>
              <p class="text-sm text-neutral-600">
                {{ chaosSpaceEventTemplateFormValue().description }}
              </p>
            </div>
          </div>
        </ng-template>
      </p-confirmDialog>
    } @else {
      <!-- Data Not Found Message -->
      <p class="mt-12">
        No chaos space event template found in this session with ID
        <span class="font-bold">{{ chaosSpaceEventTemplateId() }}</span>
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

  private readonly chaosSpaceEventTemplates = toSignal(
    this.gameboardService.chaosSpaceEventTemplates$,
  );

  readonly chaosSpaceEventTemplateId: Signal<number> = input(0, {
    transform: numberAttribute,
  }); // route param

  readonly originalChaosSpaceEventTemplate: Signal<ChaosSpaceEventTemplateModel | null> =
    input.required(); // route resolve data

  readonly confirmSubmitChangesDialogKey = 'edit-chaos-space-event-template';

  readonly deleting = signal(false);
  readonly submittingChange = signal(false);
  readonly performingAction = computed(
    () => this.deleting() || this.submittingChange(),
  );

  readonly headerText = computed(
    () => `Edit ${this.originalChaosSpaceEventTemplate()?.name ?? ''}`,
  );

  readonly deleteButtonDisabled = computed(
    () =>
      this.performingAction() ||
      [
        ChaosSpaceEventType.EveryoneGainsPointsBasedOnRank,
        ChaosSpaceEventType.PointSwap,
        undefined,
      ].includes(this.originalChaosSpaceEventTemplate()?.type),
  );

  readonly deleteButtonText = computed(
    () =>
      `${[ChaosSpaceEventType.EveryoneGainsPointsBasedOnRank, ChaosSpaceEventType.PointSwap, undefined].includes(this.originalChaosSpaceEventTemplate()?.type) ? 'Cannot' : ''} Delete ${this.originalChaosSpaceEventTemplate()?.name ?? ''}`,
  );

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
      async (chaosSpaceEventTemplate) =>
        this.gameboardService.updateChaosSpaceEventTemplate(
          this.chaosSpaceEventTemplateId(),
          chaosSpaceEventTemplate,
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
    const originalChaosSpaceEventTemplate =
      this.originalChaosSpaceEventTemplate();

    if (!originalChaosSpaceEventTemplate) return;

    this.formGroup.setValue({
      name: originalChaosSpaceEventTemplate.name,
      description: originalChaosSpaceEventTemplate.description,
      type: originalChaosSpaceEventTemplate.type,

      // don't assume the database JSON is valid
      lastPlacePoints:
        (
          originalChaosSpaceEventTemplate.details as ChaosSpaceEventDetails<ChaosSpaceEventType.EveryoneGainsPointsBasedOnRank>
        )?.lastPlacePoints ?? 24,
      taskName:
        (
          originalChaosSpaceEventTemplate.details as ChaosSpaceEventDetails<ChaosSpaceEventType.EveryoneLosesPercentageOfTheirPointsBasedOnTaskFailure>
        )?.taskName ?? ' ',
      percentageLoss:
        (
          originalChaosSpaceEventTemplate.details as ChaosSpaceEventDetails<ChaosSpaceEventType.EveryoneLosesPercentageOfTheirPoints>
        )?.percentageLoss ?? 10,
    });
  }

  confirmDelete(
    chaosSpaceEventTemplateId: number,
    chaosSpaceEventTemplateName: string,
  ): void {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.deleteChaosSpaceEventTemplate(
          chaosSpaceEventTemplateId,
        ),
      confirmationMessageText: `Are you sure you want to delete ${chaosSpaceEventTemplateName}?`,
      successMessageText: `Deleted ${chaosSpaceEventTemplateName}`,
      successNavigation: '..',
      submittingSignal: this.deleting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }
}
