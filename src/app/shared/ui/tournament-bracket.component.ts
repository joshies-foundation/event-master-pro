import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree';
import { EventTeamModel } from '../util/supabase-types';
import { EventService } from '../data-access/event.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ParticipantListPipe } from './participant-list.pipe';
import { ButtonModule } from 'primeng/button';
import { confirmBackendAction } from '../util/dialog-helpers';
import { ActivatedRoute, Router } from '@angular/router';

interface EventTeamModelWithWinnerFlag extends EventTeamModel {
  isWinner: boolean;
}

@Component({
  selector: 'joshies-tournament-bracket',
  template: `
    <p-tree
      [value]="bracket()"
      layout="horizontal"
      [styleClass]="bracket().length ? 'rotate-180' : ''"
      [selectionMode]="'checkbox'"
      (onNodeSelect)="setMatchWinnerEvent($event, bracket(), selectedNodes)"
      [(selection)]="selectedNodes"
      propagateSelectionUp="false"
      propagateSelectionDown="false"
      class="mt-4 block"
    >
      <ng-template let-node pTemplate="node">
        <div class="flex h-8 w-40 rotate-180 items-center">
          <span class="mr-1 text-xs text-neutral-400">{{
            node.data?.seed
          }}</span>
          <p-avatarGroup styleClass="mr-1">
            @for (
              participant of node.data.participants;
              track participant.participant_id
            ) {
              <p-avatar [image]="participant.avatar_url" shape="circle" />
            }
          </p-avatarGroup>
          <span class="text-neutral-800text-sm">
            {{ node.data.participants | participantList }}
          </span>
          @if (node.checked) {
            <i
              class="pi pi-check mr-1 ml-auto block rounded-full bg-green-500 p-1 text-xs font-bold text-white"
            ></i>
          }
        </div>
      </ng-template>
    </p-tree>

    <div class="flex flex-row gap-2">
      <!-- Submit Button -->
      <p-button
        label="Save"
        styleClass="w-full mt-6"
        class="flex-1"
        [hidden]="!editable()"
        (onClick)="save()"
      />
      <!-- commenting out because we forget what it does -->
      <!--      <p-button-->
      <!--        label="Submit & End Event"-->
      <!--        styleClass="w-full mt-2"-->
      <!--        class="flex-1"-->
      <!--        severity="success"-->
      <!--        [hidden]="!editable()"-->
      <!--        [disabled]="submitDisabled()"-->
      <!--        (onClick)="confirmSubmit()"-->
      <!--      />-->
    </div>
  `,
  styles: `
    :host ::ng-deep {
      .p-tree-toggler {
        display: none;
      }

      .p-treenode {
        padding: 0 0.5rem;

        .p-treenode-content {
          width: max-content;
          border: none;
          margin-top: 1.5rem;
          margin-bottom: -1.25rem;

          &.p-highlight {
            background-color: var(--yellow-highlight);
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TreeModule,
    AvatarModule,
    AvatarGroupModule,
    ParticipantListPipe,
    ButtonModule,
  ],
})
export class TournamentBracketComponent {
  private readonly eventService = inject(EventService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  log(x: unknown) {
    console.log(x);
  }

  private readonly treeContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('treeContainer');

  readonly editable = input<boolean>();

  private readonly eventTeams = computed(() =>
    this.eventService
      .eventTeamsWithParticipantInfo()
      ?.filter((eventTeam) => eventTeam.event_id === this.eventId()),
  );

  readonly eventId = input.required<number>();

  readonly submitting = signal<boolean>(false);

  readonly bracket = computed(() => {
    const bracket = this.generateBracket(this.eventTeams());

    const teamsByRound = this.eventService.getTeamsByRound(
      this.eventId(),
      this.eventService.brackets(),
    );

    bracket[0].children?.forEach((node) => {
      this.setWinnersRecursively(node, bracket, 0, teamsByRound);
    });
    return bracket;
  });

  private readonly submitToggle = signal<boolean>(false);

  readonly submitDisabled = computed(() => {
    this.submitToggle(); // Call for dependency
    return (this.bracket()[0].data?.seed ?? -1) < 0;
  });

  private setWinnersRecursively(
    node: TreeNode<Partial<EventTeamModelWithWinnerFlag>>,
    bracket: TreeNode<Partial<EventTeamModelWithWinnerFlag>>[],
    depth: number,
    teamsByRound: number[][],
  ) {
    node.children?.forEach((child) => {
      this.setWinnersRecursively(child, bracket, depth + 1, teamsByRound);
    });
    if (
      node.data &&
      node.data.seed &&
      teamsByRound[depth] &&
      teamsByRound[depth].includes(node.data.seed)
    ) {
      node.checked = true;
      this.selectedNodes.push(node);
      this.setMatchWinner(node, bracket, this.selectedNodes);
    }
  }

  private addTeamsByRoundRecursively(
    teamsByRound: number[][],
    node: TreeNode<Partial<EventTeamModelWithWinnerFlag>>,
    depth: number,
  ) {
    if (!teamsByRound[depth]) {
      teamsByRound.push([]);
    }

    if (node.data && node.data.seed) {
      teamsByRound[depth].push(node.data.seed);
    }

    node.children?.forEach((node) =>
      this.addTeamsByRoundRecursively(teamsByRound, node, depth + 1),
    );
  }

  readonly selectedNodes: TreeNode<Partial<EventTeamModelWithWinnerFlag>>[] =
    [];

  generateBracket(
    eventTeams: EventTeamModel[] | undefined,
  ): TreeNode<Partial<EventTeamModelWithWinnerFlag>>[] {
    if (!eventTeams) {
      return [{}];
    }

    const nodeTemplate = { expanded: true, type: 'node' };
    const bracket = this.generateBracketRecursively(
      { data: { seed: 1, isWinner: false } },
      eventTeams.length,
      1,
      eventTeams,
      nodeTemplate,
      false,
    );

    return [bracket];
  }

  private generateBracketRecursively(
    parentNode: TreeNode<Partial<EventTeamModelWithWinnerFlag>>,
    numberOfTeams: number,
    numberOfTeamsInRound: number,
    eventTeams: EventTeamModel[],
    nodeTemplate: TreeNode,
    isLowSeed: boolean,
  ): TreeNode<Partial<EventTeamModelWithWinnerFlag>> {
    const bracketNode: TreeNode<Partial<EventTeamModelWithWinnerFlag>> = {
      ...nodeTemplate,
      data: {
        seed: isLowSeed
          ? parentNode.data!.seed
          : numberOfTeamsInRound + 1 - parentNode.data!.seed!,
        isWinner: false,
      },
    };

    if (
      2 * numberOfTeamsInRound + 1 - bracketNode.data!.seed! >
      numberOfTeams
    ) {
      bracketNode.data = {
        ...eventTeams.find(
          (eventTeam) => eventTeam.seed === bracketNode.data!.seed,
        ),
      };
      return bracketNode;
    }

    bracketNode.children = [
      this.generateBracketRecursively(
        bracketNode,
        numberOfTeams,
        2 * numberOfTeamsInRound,
        eventTeams,
        nodeTemplate,
        false,
      ),
      this.generateBracketRecursively(
        bracketNode,
        numberOfTeams,
        2 * numberOfTeamsInRound,
        eventTeams,
        nodeTemplate,
        true,
      ),
    ];

    delete bracketNode.data!.seed;

    return bracketNode;
  }

  setMatchWinnerEvent(
    ev: TreeNodeSelectEvent,
    bracket: TreeNode<Partial<EventTeamModelWithWinnerFlag>>[],
    selectedNodes: TreeNode<Partial<EventTeamModelWithWinnerFlag>>[],
  ) {
    if (!this.editable()) {
      return;
    }
    this.setMatchWinner(ev.node, bracket, selectedNodes);
    this.submitToggle.set(!this.submitToggle()); // Force Submit button to re-evaluate
  }

  setMatchWinner(
    node: TreeNode<Partial<EventTeamModelWithWinnerFlag>>,
    bracket: TreeNode<Partial<EventTeamModelWithWinnerFlag>>[],
    selectedNodes: TreeNode<Partial<EventTeamModelWithWinnerFlag>>[],
  ) {
    const parent = this.getNodeParent(node, bracket[0]);

    if (parent) {
      parent.data = node.data;
    }

    const sibling = parent?.children?.find((child) => child !== node);

    const siblingIndex =
      selectedNodes.findIndex((node) => node === sibling) ?? -1;

    if (siblingIndex !== -1) {
      selectedNodes.splice(siblingIndex, 1);
    }
  }

  private getNodeParent(
    node: TreeNode,
    rootNode: TreeNode,
  ): TreeNode | undefined {
    if (rootNode.children) {
      for (const child of rootNode.children) {
        if (child === node) {
          return rootNode;
        }

        const parent = this.getNodeParent(node, child);
        if (parent) {
          return parent;
        }
      }
    }

    return undefined;
  }

  save() {
    const teamsByRound: number[][] = [];

    const root = this.bracket()[0];
    if (root.data && root.data.seed) {
      teamsByRound.push([root.data?.seed]);
    } else {
      teamsByRound.push([]);
    }

    this.bracket()[0].children?.forEach((node) =>
      this.addTeamsByRoundRecursively(teamsByRound, node, 1),
    );

    confirmBackendAction({
      action: async () =>
        this.eventService.saveTournamentState(this.eventId(), teamsByRound),
      confirmationMessageText: `Are you sure you want to save the bracket state?`,
      successMessageText: 'Bracket saved',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmSubmit() {
    const teamsByRound: number[][] = [];

    const root = this.bracket()[0];
    if (root.data && root.data.seed) {
      teamsByRound.push([root.data?.seed]);
    } else {
      teamsByRound.push([]);
    }

    this.bracket()[0].children?.forEach((node) =>
      this.addTeamsByRoundRecursively(teamsByRound, node, 1),
    );
    confirmBackendAction({
      action: async () =>
        this.eventService.submitTournamentResults(this.eventId(), teamsByRound),
      confirmationMessageText: `Are you sure you want to submit the bracket and end the event?`,
      successMessageText: 'Event completed',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }
}
