import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
  OnInit,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { EventModel } from '../../shared/util/supabase-types';
import { Form, FormComponent } from '../../shared/ui/form.component';
import { ModelFormGroup } from '../../shared/util/form-helpers';
import { EventForm, eventFormFactory } from '../util/event-form';
import { EventService } from '../../shared/data-access/event.service';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventFormat } from '../../shared/util/supabase-helpers';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'joshies-edit-event-page',
  template: `
    <joshies-page-header [headerText]="headerText()" alwaysSmall>
      <joshies-header-link
        text="Events"
        routerLink="../.."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Form -->
    <joshies-form [form]="form" class="block mt-8 mb-20" />

    <!-- Confirm Dialog -->
    <p-confirmDialog styleClass="mx-4" [key]="confirmDialogKey">
      <ng-template #message>
        <div class="block">
          <p class="mb-6">
            Are you sure you want to submit changes for
            {{ originalEvent()?.name ?? 'this event' }}?
          </p>
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    FormComponent,
    ConfirmDialogModule,
  ],
})
export default class EditEventPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly gameStateService = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly eventService = inject(EventService);

  readonly headerText = computed(
    () => `Edit ${this.originalEvent()?.name ?? ''}`,
  );

  readonly eventId: Signal<number> = input(0, {
    transform: numberAttribute,
  }); // route param

  readonly originalEvent: Signal<EventModel | null> = input.required(); // route resolve data

  readonly confirmDialogKey = 'edit-event';

  readonly submittingChange = signal(false);

  readonly form: Form;
  readonly formGroup: ModelFormGroup<EventForm>;
  readonly eventFormValue: Signal<EventForm>;

  constructor() {
    ({
      eventForm: this.form,
      eventFormGroup: this.formGroup,
      eventFormValue: this.eventFormValue,
    } = eventFormFactory(
      async (event) => {
        return this.eventService.updateEvent(this.eventId() ?? -1, event);
      },
      `Submit Changes`,
      (name) => `${name} event updated`,
      this.formBuilder,
      this.submittingChange,
      this.submittingChange,
      this.confirmDialogKey,
      this.gameStateService,
      this.router,
      this.activatedRoute,
      this.confirmationService,
      this.messageService,
      this.eventService,
    ));
  }

  // initialize form to original values
  ngOnInit(): void {
    const originalEvent = this.originalEvent();

    if (!originalEvent) return;

    this.formGroup.patchValue({
      name: originalEvent.name,
      description: originalEvent.description ?? '',
      rules: originalEvent.rules ?? '',
      teamSize: originalEvent.team_size,
      scoringMap: `{${originalEvent.scoring_map.toString()}}`,
      imageUrl: originalEvent.image_url ?? '',
      pointsLabel: originalEvent.points_label ?? 'points',
      lowerScoresAreBetter: originalEvent.lower_scores_are_better,
      format:
        (originalEvent.format as EventFormat) ??
        EventFormat.ScoreBasedSingleRound,
    });
  }
}
