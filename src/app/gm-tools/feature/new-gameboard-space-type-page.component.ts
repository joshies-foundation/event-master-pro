import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { FormBuilder } from '@angular/forms';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { GameboardSpaceEffectWithData } from '../../shared/util/supabase-types';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { SessionService } from '../../shared/data-access/session.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';
import {
  GameboardSpaceTypeForm,
  gameboardSpaceFormFactory,
} from '../util/gameboard-space-form';

@Component({
  selector: 'joshies-new-space-type-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    GameboardSpaceComponent,
    FormComponent,
    ConfirmDialogModule,
    GameboardSpaceDescriptionPipe,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <joshies-header-link
        text="Back"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Visual Preview -->
    <joshies-gameboard-space
      [model]="gameboardSpaceFormValue()"
      class="mt-5 mb-3 mx-auto"
    />

    <!-- Form -->
    <joshies-form [form]="form" />

    <!-- Confirm Dialog -->
    <p-confirmDialog styleClass="mx-3" [key]="confirmDialogKey">
      <ng-template pTemplate="message">
        <div class="block">
          <p class="mt-0 mb-4">
            Are you sure you want to create the
            <strong>{{ gameboardSpaceName() }} Space</strong>?
          </p>

          <div class="flex gap-3">
            <joshies-gameboard-space [model]="gameboardSpaceFormValue()" />
            <div>
              <h4 class="mt-0 mb-2">{{ gameboardSpaceName() }} Space</h4>
              <div
                class="text-sm text-600"
                [innerHtml]="
                  gameboardSpacePreviewData() | gameboardSpaceDescription
                "
              ></div>
            </div>
          </div>
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewGameboardSpaceTypePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);
  private readonly gameStateService = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);

  readonly confirmDialogKey = 'create-gameboard-space';

  readonly submitting = signal(false);

  readonly headerText = computed(() =>
    this.gameboardSpaceName()
      ? `${this.gameboardSpaceName()} Space`
      : 'New Space Type',
  );

  readonly form: Form;
  readonly formGroup: ModelFormGroup<GameboardSpaceTypeForm>;
  readonly gameboardSpaceFormValue: Signal<GameboardSpaceTypeForm>;
  readonly gameboardSpaceName: Signal<string>;
  readonly gameboardSpacePreviewData: Signal<GameboardSpaceEffectWithData>;

  constructor() {
    ({
      gameboardSpaceForm: this.form,
      gameboardSpaceFormGroup: this.formGroup,
      gameboardSpaceFormValue: this.gameboardSpaceFormValue,
      gameboardSpaceName: this.gameboardSpaceName,
      gameboardSpacePreviewData: this.gameboardSpacePreviewData,
    } = gameboardSpaceFormFactory(
      async (gameboardSpace) =>
        this.sessionService.createNewGameboardSpaceType(gameboardSpace),
      (name) => `Create ${name} Space`,
      (name) => `${name} Space created`,
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
