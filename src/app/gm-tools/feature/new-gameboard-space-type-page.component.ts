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
import { FormBuilder, Validators } from '@angular/forms';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import {
  ModelFormGroup,
  formValueSignal,
} from '../../shared/util/form-helpers';
import { GameboardSpaceEffectWithData } from '../../shared/util/supabase-types';
import {
  GameboardSpaceEffect,
  showMessageOnError,
} from '../../shared/util/supabase-helpers';
import {
  FormField,
  FormFieldType,
} from '../../shared/ui/form-field/form-field.component';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { SessionService } from '../../shared/data-access/session.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { GameboardSpaceDescriptionPipe } from '../ui/gameboard-space-description.pipe';

interface NewGameboardSpaceTypeForm {
  name: string;
  color: string;
  icon_class: string;
  effect: GameboardSpaceEffect;
  pointsGained: number;
  activityDescription: string | undefined;
}

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
    <joshies-page-header
      [headerText]="name() ? name() + ' Space' : 'New Space Type'"
      alwaysSmall
    >
      <joshies-header-link
        text="Back"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <joshies-gameboard-space [model]="formValue()" class="mt-5 mb-3 mx-auto" />

    <joshies-form [form]="form" />

    <p-confirmDialog styleClass="mx-3">
      <ng-template pTemplate="message">
        <div class="block">
          <p class="mt-0 mb-4">
            Are you sure you want to create
            <strong>{{ name() }} Space</strong>?
          </p>

          <div class="flex gap-3">
            <joshies-gameboard-space [model]="formValue()" />
            <div>
              <h4 class="mt-0 mb-2">{{ name() }} Space</h4>
              <div
                class="text-sm text-600"
                [innerHtml]="previewData() | gameboardSpaceDescription"
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

  readonly submitting = signal(false);

  readonly formGroup: ModelFormGroup<NewGameboardSpaceTypeForm> =
    this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      color: ['var(--gray-600)', Validators.required],
      icon_class: ['pi pi-bolt'],
      effect: [GameboardSpaceEffect.GainPoints, Validators.required],
      pointsGained: [0, Validators.required],
      activityDescription: ['' as string | undefined],
    });

  readonly formValue: Signal<NewGameboardSpaceTypeForm> = formValueSignal(
    this.formGroup,
  );

  private readonly effect: Signal<GameboardSpaceEffect> = computed(
    () => this.formValue().effect,
  );

  readonly name: Signal<string> = computed(() => this.formValue().name);

  readonly previewData: Signal<GameboardSpaceEffectWithData> = computed(
    (): GameboardSpaceEffectWithData => {
      const { effect, pointsGained, activityDescription } = this.formValue();

      return {
        effect,
        effect_data: {
          pointsGained,
          ...(effect === GameboardSpaceEffect.GainPointsOrDoActivity
            ? { activity: { description: activityDescription } }
            : {}),
        },
      } as GameboardSpaceEffectWithData;
    },
  );

  readonly form: Form = {
    formGroup: this.formGroup,
    disabled: this.submitting,
    fields: computed((): FormField[] => [
      {
        type: FormFieldType.Text,
        name: 'name',
        label: 'Name',
        placeholder: 'Blue',
        control: this.formGroup.controls.name,
      },
      {
        type: FormFieldType.Dropdown,
        name: 'color',
        label: 'Color',
        placeholder: 'Color',
        options: [
          {
            label: 'Red',
            value: 'var(--red-600)',
          },
          {
            label: 'Orange',
            value: 'var(--orange-600)',
          },
          {
            label: 'Yellow',
            value: 'var(--yellow-600)',
          },
          {
            label: 'Green',
            value: 'var(--green-500)',
          },
          {
            label: 'Blue',
            value: 'var(--blue-500)',
          },
          {
            label: 'Purple',
            value: 'var(--purple-500)',
          },
          {
            label: 'Pink',
            value: 'var(--pink-500)',
          },
          {
            label: 'Teal',
            value: 'var(--teal-500)',
          },
          {
            label: 'Brown',
            value: 'var(--orange-900)',
          },
          {
            label: 'Gray',
            value: 'var(--gray-600)',
          },
          {
            label: 'Black',
            value: 'black',
          },
          {
            label: 'White',
            value: 'white',
          },
        ],
        optionLabel: 'label',
        optionValue: 'value',
        control: this.formGroup.controls.color,
      },
      {
        type: FormFieldType.Text,
        name: 'icon-class',
        label: 'Icon Class',
        placeholder: 'pi pi-bolt',
        control: this.formGroup.controls.icon_class,
      },
      {
        type: FormFieldType.Dropdown,
        name: 'effect',
        label: 'Effect',
        placeholder: 'Effect',
        options: Object.values(GameboardSpaceEffect).map((effect) => ({
          label: effect
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          value: effect,
        })),
        optionLabel: 'label',
        optionValue: 'value',
        control: this.formGroup.controls.effect,
      },
      {
        type: FormFieldType.Number,
        name: 'points-gained',
        label: 'Number of Points Gained',
        showButtons: true,
        control: this.formGroup.controls.pointsGained,
      },
      {
        type: FormFieldType.Text,
        name: 'activity',
        label: 'Alternative Activity',
        required: this.effect() === GameboardSpaceEffect.GainPointsOrDoActivity,
        visible: this.effect() === GameboardSpaceEffect.GainPointsOrDoActivity,
        placeholder: 'Take a shot',
        control: this.formGroup.controls.activityDescription,
      },
      {
        type: FormFieldType.Submit,
        name: 'submit',
        label: `Create ${this.name()} Space`,
        position: 'full',
      },
    ]),
    onSubmit: () => this.confirmSubmit(),
  };

  async confirmSubmit() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      // dialog content defined in template
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        this.submitting.set(true);

        const {
          name,
          color,
          icon_class,
          effect,
          pointsGained,
          activityDescription,
        } = this.formValue();

        const { error } = await showMessageOnError(
          this.sessionService.createNewGameboardSpaceType({
            name,
            color,
            icon_class,
            session_id: this.gameStateService.sessionId()!,
            effect,
            effect_data: {
              pointsGained,
              ...(effect === GameboardSpaceEffect.GainPointsOrDoActivity
                ? { activity: { description: activityDescription } }
                : {}),
            },
          }),
          this.messageService,
        );

        if (error) {
          this.submitting.set(false);
          return;
        }

        showSuccessMessage('Score saved successfully', this.messageService);
        this.router.navigate(['..'], { relativeTo: this.activatedRoute });
      },
    });
  }
}
