import { Signal, WritableSignal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  FormField,
  FormFieldType,
} from '../../shared/ui/form-field/form-field.component';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import {
  ModelFormGroup,
  formValueSignal,
} from '../../shared/util/form-helpers';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';
import { Form } from '../../shared/ui/form.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import {
  GameboardSpaceEffectWithData,
  GameboardSpaceModel,
  OmitAutoGeneratedColumns,
} from '../../shared/util/supabase-types';

export interface GameboardSpaceTypeForm {
  name: string;
  color: string;
  icon_class: string;
  effect: GameboardSpaceEffect;
  pointsGained: number;
  activityDescription: string | undefined;
}

export function gameboardSpaceFormFactory(
  saveMethod: (
    gameboardSpace: OmitAutoGeneratedColumns<GameboardSpaceModel>,
  ) => Promise<PostgrestSingleResponse<null>>,
  submitButtonText: (spaceName: string) => string,
  successText: (spaceName: string) => string,
  formBuilder: FormBuilder,
  submittingSignal: WritableSignal<boolean>,
  formDisabledSignal: Signal<boolean>,
  confirmDialogKey: string,
  gameStateService: GameStateService,
  router: Router,
  activatedRoute: ActivatedRoute,
  confirmationService: ConfirmationService,
  messageService: MessageService,
): {
  gameboardSpaceForm: Form;
  gameboardSpaceFormGroup: ModelFormGroup<GameboardSpaceTypeForm>;
  gameboardSpaceFormValue: Signal<GameboardSpaceTypeForm>;
  gameboardSpaceName: Signal<string>;
  gameboardSpaceEffect: Signal<GameboardSpaceEffect>;
  gameboardSpacePreviewData: Signal<GameboardSpaceEffectWithData>;
} {
  const gameboardSpaceFormGroup: ModelFormGroup<GameboardSpaceTypeForm> =
    formBuilder.nonNullable.group({
      name: ['', Validators.required],
      color: ['var(--gray-600)', Validators.required],
      icon_class: ['pi pi-bolt'],
      effect: [GameboardSpaceEffect.GainPoints, Validators.required],
      pointsGained: [0, Validators.required],
      activityDescription: ['' as string | undefined],
    });

  const gameboardSpaceFormValue: Signal<GameboardSpaceTypeForm> =
    formValueSignal(gameboardSpaceFormGroup);

  const gameboardSpaceEffect: Signal<GameboardSpaceEffect> = computed(
    () => gameboardSpaceFormValue().effect,
  );

  const gameboardSpaceName: Signal<string> = computed(
    () => gameboardSpaceFormValue().name,
  );

  const gameboardSpacePreviewData: Signal<GameboardSpaceEffectWithData> =
    computed((): GameboardSpaceEffectWithData => {
      const { effect, pointsGained, activityDescription } =
        gameboardSpaceFormValue();

      return {
        effect,
        effect_data: {
          pointsGained,
          ...(effect === GameboardSpaceEffect.GainPointsOrDoActivity
            ? { activity: { description: activityDescription } }
            : {}),
        },
      } as GameboardSpaceEffectWithData;
    });

  const gameboardSpaceForm = {
    formGroup: gameboardSpaceFormGroup,
    disabled: formDisabledSignal,
    fields: computed((): FormField[] => [
      {
        type: FormFieldType.Text,
        name: 'name',
        label: 'Name',
        placeholder: 'Blue',
        control: gameboardSpaceFormGroup.controls.name,
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
            value: 'var(--green-600)',
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
        control: gameboardSpaceFormGroup.controls.color,
      },
      {
        type: FormFieldType.Text,
        name: 'icon-class',
        label: 'Icon Class',
        placeholder: 'Eg: pi pi-bolt',
        control: gameboardSpaceFormGroup.controls.icon_class,
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
        control: gameboardSpaceFormGroup.controls.effect,
      },
      {
        type: FormFieldType.Number,
        name: 'points-gained',
        label: 'Number of Points Gained',
        showButtons: true,
        control: gameboardSpaceFormGroup.controls.pointsGained,
      },
      {
        type: FormFieldType.Text,
        name: 'activity',
        label: 'Alternative Activity',
        required:
          gameboardSpaceEffect() ===
          GameboardSpaceEffect.GainPointsOrDoActivity,
        visible:
          gameboardSpaceEffect() ===
          GameboardSpaceEffect.GainPointsOrDoActivity,
        placeholder: 'Take a shot',
        control: gameboardSpaceFormGroup.controls.activityDescription,
      },
      {
        type: FormFieldType.Submit,
        name: 'submit',
        label: submitButtonText(gameboardSpaceName()),
        loading: submittingSignal(),
        position: 'full',
      },
    ]),
    onSubmit: () =>
      confirmSubmit(
        gameboardSpaceFormValue(),
        gameStateService.sessionId()!,
        confirmDialogKey,
      ),
  };

  async function confirmSubmit(
    formValue: GameboardSpaceTypeForm,
    sessionId: number,
    confirmDialogKey: string,
  ) {
    const {
      name,
      color,
      icon_class,
      effect,
      pointsGained,
      activityDescription,
    } = formValue;

    confirmBackendAction({
      action: () =>
        saveMethod({
          name,
          color,
          icon_class,
          session_id: sessionId,
          effect,
          effect_data: {
            pointsGained,
            ...(effect === GameboardSpaceEffect.GainPointsOrDoActivity
              ? { activity: { description: activityDescription } }
              : {}),
          },
        }),
      successMessageText: successText(name),
      successNavigation: '..',
      confirmDialogKey,
      submittingSignal,
      router: router,
      activatedRoute: activatedRoute,
      confirmationService: confirmationService,
      messageService: messageService,
    });
  }

  return {
    gameboardSpaceForm,
    gameboardSpaceFormGroup,
    gameboardSpaceFormValue,
    gameboardSpaceName,
    gameboardSpaceEffect,
    gameboardSpacePreviewData,
  };
}