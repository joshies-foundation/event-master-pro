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
import { SessionStatus } from '../../shared/util/supabase-helpers';

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

  readonly roundLinks: Signal<CardLinkModel[] | null> = computed(() =>
    this.gameStateService.sessionIsInProgress()
      ? [
          {
            text: 'End Round & Tally Points',
            iconClass: 'pi pi-check-circle bg-green-500',
            routerLink: './end-round',
          },
        ]
      : null,
  );

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

  readonly sessionLinks: Signal<CardLinkModel[]> = computed(
    (): CardLinkModel[] => {
      const sessionStatusDependentLinks: Record<
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

      return [
        {
          text: 'Manage Gameboard Space Types',
          iconClass: 'pi pi-question-circle bg-green-500',
          routerLink: './space-types',
        },
        ...sessionStatusDependentLinks[
          this.gameStateService.sessionStatus() ?? 'undefined'
        ],
      ];
    },
  );
}
