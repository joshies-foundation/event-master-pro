import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { RoundPhase, SessionStatus } from '../../shared/util/supabase-helpers';

@Component({
  selector: 'joshies-gm-tools-pages-wrapper',
  standalone: true,
  imports: [CardComponent, PageHeaderComponent],
  template: `
    <joshies-page-header headerText="GM Tools" />

    @if (roundLinks(); as roundLinks) {
      <joshies-card headerText="Round" [links]="roundLinks" />
    }

    <joshies-card headerText="Players" [links]="playersLinks" />

    <joshies-card headerText="Session" [links]="sessionLinks()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GmToolsPageComponent {
  private readonly gameStateService = inject(GameStateService);

  private readonly roundPhaseDependentLinks: Record<
    RoundPhase | 'undefined',
    CardLinkModel[] | null
  > = {
    [RoundPhase.GameboardMoves]: [
      {
        text: 'Enter Gameboard Moves',
        iconClass: 'ci-space-entry bg-gray-500',
        routerLink: './space-entry',
      },
    ],
    [RoundPhase.SpecialSpaceEvents]: [
      {
        text: 'Manage Special Space Events',
        iconClass: 'pi pi-question-circle bg-green-500',
        routerLink: './space-resolution',
      },
    ],
    [RoundPhase.Duels]: [
      {
        text: 'Manage Duels',
        iconClass: 'pi pi-bolt bg-purple-500',
        routerLink: '.',
      },
    ],
    [RoundPhase.Event]: [
      {
        text: 'Manage Event',
        iconClass: 'pi pi-bolt bg-orange-500',
        routerLink: '.',
      },
    ],
    [RoundPhase.WaitingForNextRound]: [
      {
        text: 'End Round & Tally Points',
        iconClass: 'pi pi-check-circle bg-green-500',
        routerLink: './end-round',
      },
    ],
    undefined: null,
  };

  readonly roundLinks: Signal<CardLinkModel[] | null> = computed(() => {
    if (!this.gameStateService.sessionIsInProgress()) return null;

    return this.roundPhaseDependentLinks[
      this.gameStateService.roundPhase() ?? 'undefined'
    ];
  });

  readonly playersLinks: CardLinkModel[] = [
    {
      text: 'Override Points',
      iconClass: 'pi pi-sliders-h bg-purple-500',
      routerLink: './override-points',
    },
    {
      text: 'Edit Player Profiles',
      iconClass: 'pi pi-user-edit bg-blue-500',
      routerLink: './edit-profiles',
    },
    {
      text: 'Edit Player Permissions',
      iconClass: 'pi pi-lock bg-orange-500',
      routerLink: './edit-permissions',
    },
    {
      text: 'Make Someone Else the GM',
      iconClass: 'pi pi-crown bg-yellow-500',
      routerLink: './change-gm',
    },
  ];

  private readonly sessionStatusDependentLinks: Record<
    SessionStatus | 'undefined',
    CardLinkModel[]
  > = {
    [SessionStatus.NotStarted]: [
      {
        text: 'Start Session Early',
        iconClass: 'pi pi-play-circle bg-green-500',
        routerLink: './start-session-early',
      },
    ],
    [SessionStatus.InProgress]: [
      {
        text: 'End Session',
        iconClass: 'pi pi-stop-circle bg-red-600',
        routerLink: './end-session',
      },
    ],
    [SessionStatus.Finished]: [
      {
        text: 'Create Session',
        iconClass: 'pi pi-plus bg-blue-500',
        routerLink: './create-session',
      },
    ],
    undefined: [],
  };

  readonly sessionLinks: Signal<CardLinkModel[]> = computed(
    (): CardLinkModel[] => {
      return [
        {
          text: 'Manage Gameboard Space Types',
          iconClass: 'pi pi-question-circle bg-green-500',
          routerLink: './space-types',
        },
        {
          text: 'Manage Events',
          iconClass: 'pi pi-flag bg-purple-500',
          routerLink: './events',
        },
        {
          text: 'Create Brackets',
          iconClass: 'pi pi-sitemap bg-yellow-500',
          routerLink: './brackets',
        },
        ...this.sessionStatusDependentLinks[
          this.gameStateService.sessionStatus() ?? 'undefined'
        ],
      ];
    },
  );
}
