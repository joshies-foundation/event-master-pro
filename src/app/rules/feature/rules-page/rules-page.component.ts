import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
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
import { FormBuilder, FormsModule } from '@angular/forms';
import { Form, FormComponent } from '../../../shared/ui/form.component';
import {
  FormField,
  FormFieldType,
} from '../../../shared/ui/form-field/form-field.component';
import { SessionService } from '../../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FooterService } from '../../../shared/data-access/footer.service';
import { PlayerService } from '../../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../../shared/util/signal-helpers';
import { EventService } from '../../../shared/data-access/event.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { CardComponent } from '../../../shared/ui/card.component';
import { GameboardService } from '../../../shared/data-access/gameboard.service';
import { GameboardSpaceComponent } from '../../../gm-tools/ui/gameboard-space.component';
import { GameboardSpaceDescriptionPipe } from '../../../gm-tools/ui/gameboard-space-description.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { confirmBackendAction } from '../../../shared/util/dialog-helpers';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'joshies-rules-page',
  templateUrl: './rules-page.component.html',
  host: {
    class: 'block pb-12',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SkeletonModule,
    FormsModule,
    FormComponent,
    ButtonModule,
    ConfirmDialogModule,
    RouterLink,
    RouterLinkActive,
    CardComponent,
    GameboardSpaceComponent,
    GameboardSpaceDescriptionPipe,
    ImageModule,
  ],
})
export default class RulesPageComponent {
  private readonly rulesService = inject(RulesService);
  private readonly sessionService = inject(SessionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly playerService = inject(PlayerService);
  private readonly eventService = inject(EventService);
  private readonly gameboardService = inject(GameboardService);
  private readonly footerService = inject(FooterService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  private readonly rules = this.rulesService.rules;

  private readonly editMode = signal(false);
  private readonly savingRules = signal(false);

  private readonly formGroup = computed(() =>
    this.formBuilder.nonNullable.group({
      intro: [this.rules()?.intro ?? ''],
      events: [this.rules()?.events ?? ''],
      gameboard: [this.rules()?.gameboard ?? ''],
      special_space_events: [this.rules()?.special_space_events ?? ''],
      chaos_space_events: [this.rules()?.chaos_space_events ?? ''],
    }),
  );

  private readonly form = computed(
    (): Form => ({
      formGroup: this.formGroup(),
      onSubmit: () => this.confirmSaveRules(),
      disabled: this.savingRules,
      fields: computed((): FormField[] => [
        {
          name: 'intro',
          label: 'Intro',
          placeholder: 'Intro',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.intro,
        },
        {
          name: 'events',
          label: 'Events',
          placeholder: 'Events',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.events,
        },
        {
          name: 'gameboard',
          label: 'Gameboard',
          placeholder: 'Gameboard',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.gameboard,
        },
        {
          name: 'special-space-events',
          label: 'Special Space Events',
          placeholder: 'Special Space Events',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.special_space_events,
        },
        {
          name: 'chaos-space-events',
          label: 'Chaos Space Events',
          placeholder: 'Chaos Space Events',
          type: FormFieldType.Editor,
          control: this.formGroup().controls.chaos_space_events,
        },
        {
          name: 'submit',
          label: 'Save Rules',
          type: FormFieldType.Submit,
          position: 'full',
          loading: this.savingRules(),
        },
      ]),
    }),
  );

  private readonly disableFooterEffect = effect(() =>
    this.editMode()
      ? this.footerService.enableFooter()
      : this.footerService.disableFooter(),
  );

  private readonly scrollToAnchorAfterRulesLoad = effect(() => {
    this.viewModel();

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      skipLocationChange: true,
      preserveFragment: true,
    });
  });

  readonly specialSpaceEvents = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );
  readonly chaosSpaceEvents = toSignal(
    this.gameboardService.chaosSpaceEventTemplates$,
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      editMode: this.editMode(),
      userIsGameMaster: this.playerService.userIsGameMaster(),
      rules: this.rules(),
      form: this.form(),
      events: this.eventService.events(),
      spaces: this.gameboardService.gameboardSpaces(),
      specialSpaceEvents: this.specialSpaceEvents(),
      chaosSpaceEvents: this.chaosSpaceEvents(),
    }),
  );

  private async confirmSaveRules(): Promise<void> {
    confirmBackendAction({
      action: async () => {
        this.exitEditMode();

        return this.rulesService.updateRules(
          this.sessionService.session()!.id,
          this.formGroup().getRawValue(),
        );
      },
      confirmationMessageText: 'Are you sure you want to save these rules?',
      successMessageText: 'Rules saved',
      submittingSignal: this.savingRules,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  enterEditMode(): void {
    this.editMode.set(true);
  }

  exitEditMode(): void {
    this.editMode.set(false);
    this.formGroup().reset();
  }

  confirmCancel(): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want close the editor?  Any unsaved changes will be lost.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.exitEditMode(),
    });
  }
}
