import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../../shared/data-access/player.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { SessionService } from '../../shared/data-access/session.service';
import { ButtonModule } from 'primeng/button';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LocalStorageRecord,
  getRecordFromLocalStorage,
  saveRecordToLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberSignPipe } from '../../shared/ui/number-sign.pipe';
import { NumberSignColorClassPipe } from '../../shared/ui/number-sign-color-class.pipe';
import { EventService } from '../../shared/data-access/event.service';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { switchMap } from 'rxjs';

@Component({
  selector: 'joshies-end-round-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    TableModule,
    InputNumberModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    ButtonModule,
    StronglyTypedTableRowDirective,
    NumberSignPipe,
    NumberSignColorClassPipe,
    AvatarGroupModule,
    AvatarModule,
  ],
  template: `
    <joshies-page-header headerText="End Round" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-6">
        Tally score changes for round {{ vm.roundNumber }} of {{ vm.numRounds }}
      </h4>

      <p-table
        [value]="vm.teams!"
        [formGroup]="vm.formGroup"
        [defaultSortOrder]="1"
        sortField="position"
        [sortOrder]="1"
        [scrollable]="true"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Team Seed</th>
            <th>Pos</th>
            <th class="text-right">Score Change</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.teams!"
          let-team
        >
          <tr>
            <td>
              <div class="flex align-items-center gap-2">
                {{ team.seed }}
                <p-avatarGroup styleClass="mr-2">
                  @for (
                    participant of team.participants;
                    track participant.participant_id
                  ) {
                    <p-avatar
                      [image]="participant.avatar_url"
                      size="large"
                      shape="circle"
                    />
                  }
                </p-avatarGroup>
              </div>
            </td>
            <td>
              {{ team.position }}
            </td>
            <td class="text-right">
              <p-inputNumber
                #input
                [formControlName]="team.id"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                [inputStyleClass]="
                  'w-full text-right ' +
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
        styleClass="mt-4 w-full"
        (onClick)="reviewScoreChanges()"
        icon="pi pi-chevron-right"
        iconPos="right"
      />
    } @else {
      <p-skeleton height="30rem" styleClass="mt-6" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  readonly eventTeams = computed(() => {
    const eventTeams = this.eventService
      .eventTeamsWithParticipantInfo()
      ?.filter(
        (team) =>
          team.event_id ===
          (this.eventService.eventForThisRound()?.id ?? false),
      )
      .map((team) => {
        return { ...team, score: 0, position: 1 };
      });

    if (!eventTeams) {
      return;
    }

    const eventTeamsRoundScores = this.eventService.eventTeamRoundScores();
    if (!eventTeamsRoundScores) {
      return eventTeams;
    }
    const scores = eventTeamsRoundScores.map((teamScore) => teamScore.score);

    const sortAsc = function (a: number, b: number) {
      return a - b;
    };
    const sortDesc = function (a: number, b: number) {
      return b - a;
    };
    const sortFunc = this.eventService.eventForThisRound()
      ?.lower_scores_are_better
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

    return eventTeams;
  });

  readonly formGroup = computed(() => {
    return this.formBuilder.nonNullable.group(
      this.eventTeams()!.reduce(
        (prev, team) => ({
          ...prev,
          [team.id]: [
            this.initialFormValue?.[team.id] ?? 0,
            Validators.required,
          ],
        }),
        {},
      ),
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
      roundNumber: this.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      formGroup: this.formGroup(),
      players: this.playerService.players(),
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
