import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Signal,
} from '@angular/core';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { SessionService } from '../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getRecordFromLocalStorage,
  LocalStorageRecord,
  saveRecordToLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { EventService } from '../../shared/data-access/event.service';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberSignPipe } from '../../shared/ui/number-sign.pipe';
import { NumberSignColorClassPipe } from '../../shared/ui/number-sign-color-class.pipe';
import { CardComponent } from '../../shared/ui/card.component';
import { ParticipantListPipe } from '../../shared/ui/participant-list.pipe';

@Component({
  selector: 'joshies-end-round-page',
  template: `
    <joshies-page-header headerText="Assign Session Points" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-12 mb-4 font-bold">
        Assign session points based on {{ vm.event?.name }} results
      </h4>

      <joshies-card padded styleClass="flex flex-col gap-4">
        <p-button
          label="Calculate Recommended Points"
          (onClick)="populateRecommendedScores()"
        />

        <p-table
          [value]="vm.teams!"
          [formGroup]="vm.formGroup"
          [defaultSortOrder]="1"
          sortField="position"
          [sortOrder]="1"
          [scrollable]="true"
        >
          <ng-template #header>
            <tr>
              <th>Team</th>
              <th style="padding: 0.75rem 0.25rem">Pos</th>
              <th class="text-right">Session Points</th>
            </tr>
          </ng-template>
          <ng-template
            #body
            [joshiesStronglyTypedTableRow]="vm.teams!"
            let-team
          >
            <tr>
              <td>
                <div class="flex flex-col items-center gap-2">
                  <p-avatarGroup>
                    @for (
                      participant of team.participants;
                      track participant.participant_id
                    ) {
                      <p-avatar
                        [image]="participant.avatar_url"
                        shape="circle"
                      />
                    }
                  </p-avatarGroup>
                  <div class="text-center text-xs">
                    <p class="mb-1">
                      {{ team.participants | participantList }}
                    </p>
                    <p class="m-0 text-neutral-500">
                      Event Score: <strong>{{ team.score }}</strong>
                    </p>
                  </div>
                </div>
              </td>
              <td class="text-center" style="padding: 0.75rem 0.25rem">
                {{ team.position }}
              </td>
              <td style="min-width: 10rem">
                <p-inputNumber
                  #input
                  [formControlName]="team.id"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  [step]="1"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  [inputStyleClass]="
                    'w-full text-center ' +
                    (input.value ?? 0 | numberSignColorClass)
                  "
                  [prefix]="input.value ?? 0 | numberSign"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>

        <p-button
          label="Review Score Changes"
          styleClass="mt-6 w-full"
          (onClick)="reviewScoreChanges()"
          [disabled]="formGroup().invalid"
          icon="pi pi-chevron-right"
          iconPos="right"
        />
      </joshies-card>
    } @else {
      <p-skeleton height="30rem" styleClass="mt-12" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    TableModule,
    InputNumberModule,
    ReactiveFormsModule,
    ButtonModule,
    StronglyTypedTableRowDirective,
    NumberSignPipe,
    NumberSignColorClassPipe,
    AvatarGroupModule,
    AvatarModule,
    CardComponent,
    ParticipantListPipe,
  ],
})
export default class EndRoundPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  private readonly initialFormValue: Record<string, number> =
    getRecordFromLocalStorage(LocalStorageRecord.RoundScoreFormValue);

  private readonly scoresForThisEvent = computed(() => {
    const eventTeamsForThisRound = this.eventService
      .eventTeams()
      ?.filter(
        (eventTeam) =>
          eventTeam.event_id === this.eventService.eventForThisRound()?.id,
      );
    const eventTeamRoundScores = this.eventService.eventTeamRoundScores();
    const eventTeamRoundScoresForThisEvent = eventTeamRoundScores?.filter(
      (teamScore) => {
        const indexOf = eventTeamsForThisRound?.findIndex(
          (eventTeam) => eventTeam.id === teamScore.team_id,
        );
        return indexOf != undefined && indexOf > -1;
      },
    );
    return (
      eventTeamRoundScoresForThisEvent?.map((teamScore) => teamScore.score) ??
      []
    );
  });

  readonly eventTeams = computed(() => {
    const eventForThisRound = this.eventService.eventForThisRound();
    const eventTeams = this.eventService
      .eventTeamsWithParticipantInfo()
      ?.filter((team) => team.event_id === (eventForThisRound?.id ?? false))
      .map((team) => {
        return { ...team, score: 0, position: 1 };
      });

    if (!eventTeams) {
      return;
    }

    // Commented out until double elim brackets are in
    /**
    if (eventForThisRound?.format === EventFormat.ScoreBasedSingleRound) {
    **/
    const eventTeamsRoundScores = this.eventService.eventTeamRoundScores();
    if (!eventTeamsRoundScores) {
      return eventTeams;
    }
    const scores = this.scoresForThisEvent();

    const sortAsc = function (a: number, b: number) {
      return a - b;
    };
    const sortDesc = function (a: number, b: number) {
      return b - a;
    };
    const sortFunc = eventForThisRound?.lower_scores_are_better
      ? sortAsc
      : sortDesc;
    scores.sort(sortFunc);

    eventTeams.forEach((team) => {
      team.score =
        eventTeamsRoundScores.find((teamScore) => teamScore.team_id === team.id)
          ?.score ?? -1;
      const position =
        1 + (scores.findIndex((score) => team.score === score) ?? -1);
      if (position > 0) {
        team.position = position;
      }
    });
    // Commented out until double elim brackets are in
    /**}
    else if (
      eventForThisRound?.format === EventFormat.SingleEliminationTournament
    ) {
      const brackets = this.eventService.brackets();
      const bracketArr = brackets?.filter(
        (bracket) => bracket.event_id === eventForThisRound.id,
      );
      if (bracketArr && bracketArr.length > 0) {
        const bracket = bracketArr[0];
        const teamsByRound: number[][] = JSON.parse(bracket.data ?? '[]');
        eventTeams.forEach((team) => {
          team.position =
            teamsByRound.findIndex((roundTeams) =>
              roundTeams.includes(team.seed ?? -1),
            ) + 1;
        });
      }
    }**/

    return eventTeams;
  });

  populateRecommendedScores() {
    this.formGroup().patchValue(
      this.eventTeams()?.reduce((prev, team) => {
        const scoringMap =
          this.eventService.eventForThisRound()?.scoring_map ?? [];
        return {
          ...prev,
          [team.id]: scoringMap[team.position - 1] ?? 0,
        };
      }, {}) ?? {},
    );
  }

  readonly formGroup = computed(() => {
    return this.formBuilder.nonNullable.group(
      this.eventTeams()?.reduce((prev, team) => {
        return {
          ...prev,
          [team.id]: [this.initialFormValue[team.id] ?? 0, Validators.required],
        };
      }, {}) ?? {},
    );
  });

  private readonly formGroup$ = toObservable(this.formGroup);

  private readonly formValueChanges = toSignal(
    this.formGroup$.pipe(switchMap((formGroup) => formGroup.valueChanges)),
  );

  private readonly roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      event: this.eventService.eventForThisRound(),
      roundNumber: this.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      formGroup: this.formGroup(),
      teams: this.eventTeams(),
    }),
  );

  reviewScoreChanges(): void {
    this.router.navigate(['review'], {
      relativeTo: this.activatedRoute,
    });
  }

  constructor() {
    effect(() => {
      if (this.formValueChanges()) {
        saveRecordToLocalStorage(
          LocalStorageRecord.RoundScoreFormValue,
          this.formValueChanges()!,
        );
      }
    });
  }
}
