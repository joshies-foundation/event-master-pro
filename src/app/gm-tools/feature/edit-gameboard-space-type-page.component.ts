import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Signal,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SessionService } from '../../shared/data-access/session.service';
import {
  GameboardSpaceEffectWithData,
  GameboardSpaceModel,
} from '../../shared/util/supabase-types';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import {
  GameboardSpaceTypeForm,
  gameboardSpaceFormFactory,
} from '../util/gameboard-space-form';
import { FormBuilder } from '@angular/forms';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'joshies-edit-gameboard-space-type-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    ConfirmDialogModule,
    GameboardSpaceComponent,
    FormComponent,
    GameboardSpaceDescriptionPipe,
    JsonPipe,
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

    @if (originalGameboardSpace(); as originalGameboardSpace) {
      <!-- Visual Preview -->
      <div
        class="flex gap-3 mt-5 mb-3 align-items-center justify-content-center w-full"
      >
        <joshies-gameboard-space [model]="originalGameboardSpace" />
        <i class="pi pi-arrow-right text-400"></i>
        <joshies-gameboard-space [model]="updatedGameboardSpaceFormValue()" />
      </div>

      <!-- Form -->
      <joshies-form [form]="form!" />

      <!-- Delete Button -->
      <p-button
        (onClick)="
          confirmDelete(gameboardSpaceId(), originalGameboardSpace.name)
        "
        [label]="deleteButtonText()"
        severity="danger"
        styleClass="w-full mt-6"
        [disabled]="performingAction()"
        [loading]="deleting()"
      />

      <!-- Confirm Submit Changes Dialog -->
      <p-confirmDialog styleClass="mx-3" [key]="confirmSubmitChangesDialogKey">
        <ng-template pTemplate="message">
          <div class="block">
            <p class="m-0">Are you sure you want submit these changes?</p>

            <!-- Before -->
            <h4 class="mt-4 mb-2">Before</h4>
            <div class="flex gap-3">
              <joshies-gameboard-space [model]="originalGameboardSpace" />
              <div>
                <h4 class="mt-0 mb-2">
                  {{ originalGameboardSpace.name }} Space
                </h4>
                <div
                  class="text-sm text-600"
                  [innerHtml]="
                    originalGameboardSpace | gameboardSpaceDescription
                  "
                ></div>
              </div>
            </div>

            <!-- After -->
            <h4 class="mt-3 mb-2">After</h4>
            <div class="flex gap-3">
              <joshies-gameboard-space
                [model]="updatedGameboardSpaceFormValue()"
              />
              <div>
                <h4 class="mt-0 mb-2">
                  {{ updatedGameboardSpaceName() }} Space
                </h4>
                <div
                  class="text-sm text-600"
                  [innerHtml]="
                    updatedGameboardSpacePreviewData()
                      | gameboardSpaceDescription
                  "
                ></div>
              </div>
            </div>
          </div>
        </ng-template>
      </p-confirmDialog>
    } @else {
      <!-- Data Not Found Message -->
      <p class="mt-6">
        No gameboard space found in this session with ID
        <span class="font-bold">{{ gameboardSpaceId() }}</span>
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditGameboardSpaceTypePageComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly gameStateService = inject(GameStateService);

  readonly gameboardSpaceId: Signal<number> = input(0, {
    transform: numberAttribute,
  }); // route param

  readonly originalGameboardSpace: Signal<GameboardSpaceModel | null> =
    input.required(); // route resolve data

  readonly confirmSubmitChangesDialogKey = 'edit-gameboard-space';

  readonly deleting = signal(false);
  readonly submittingChange = signal(false);
  readonly performingAction = computed(
    () => this.deleting() || this.submittingChange(),
  );

  readonly headerText = computed(
    () => `Edit ${this.originalGameboardSpace()?.name ?? ''} Space`,
  );

  readonly deleteButtonText = computed(
    () => `Delete ${this.originalGameboardSpace()?.name ?? ''} Space`,
  );

  readonly form: Form;
  readonly formGroup: ModelFormGroup<GameboardSpaceTypeForm>;
  readonly updatedGameboardSpaceFormValue: Signal<GameboardSpaceTypeForm>;
  readonly updatedGameboardSpaceName: Signal<string>;
  readonly updatedGameboardSpacePreviewData: Signal<GameboardSpaceEffectWithData>;

  constructor() {
    ({
      gameboardSpaceForm: this.form,
      gameboardSpaceFormGroup: this.formGroup,
      gameboardSpaceFormValue: this.updatedGameboardSpaceFormValue,
      gameboardSpaceName: this.updatedGameboardSpaceName,
      gameboardSpacePreviewData: this.updatedGameboardSpacePreviewData,
    } = gameboardSpaceFormFactory(
      async (gameboardSpace) =>
        this.sessionService.updateGameboardSpaceType(
          this.gameboardSpaceId() ?? -1,
          gameboardSpace,
        ),
      () => 'Submit Changes',
      (name) => `${name} Space updated`,
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
    const originalGameboardSpace = this.originalGameboardSpace();

    if (!originalGameboardSpace) return;

    this.formGroup.setValue({
      name: originalGameboardSpace.name,
      color: originalGameboardSpace.color,
      icon_class: originalGameboardSpace.icon_class ?? '',
      effect: originalGameboardSpace.effect,
      pointsGained: originalGameboardSpace.effect_data.pointsGained,
      activityDescription:
        // @ts-expect-error: this property only exists for spaces with GainPointsOrDoActivity effect
        originalGameboardSpace?.effect_data.activity?.description ?? '',
    });
  }

  confirmDelete(gameboardSpaceId: number, gameboardSpaceName: string): void {
    confirmBackendAction({
      action: async () =>
        this.sessionService.deleteGameboardSpaceType(gameboardSpaceId),
      confirmationMessageText: `Are you sure you want to delete the ${gameboardSpaceName} Space?`,
      successMessageText: `Deleted ${gameboardSpaceName} Space`,
      successNavigation: '..',
      submittingSignal: this.deleting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }
}
