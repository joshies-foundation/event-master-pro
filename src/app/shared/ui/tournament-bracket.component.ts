import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule, TreeNodeSelectEvent } from 'primeng/tree';
import { EventTeamModel } from '../util/supabase-types';
import { EventService } from '../data-access/event.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'joshies-tournament-bracket',
  standalone: true,
  template: `
    <p-tree
      [value]="bracket()"
      layout="horizontal"
      [styleClass]="bracket().length ? 'rotate-180' : ''"
      selectionMode="checkbox"
      (onNodeSelect)="setMatchWinner($event, bracket(), selectedNodes)"
      [(selection)]="selectedNodes"
      propagateSelectionUp="false"
      propagateSelectionDown="false"
    >
      <ng-template let-node pTemplate="node">
        <div class="flex align-items-center rotate-180 w-15rem h-3rem">
          <span class="text-sm text-400 mr-1">{{ node.data?.seed }}</span>
          <p-avatarGroup styleClass="mr-2">
            @for (player of node.data.players; track player.player_id) {
              <p-avatar
                [image]="player.avatar_url"
                size="large"
                shape="circle"
              />
            }
          </p-avatarGroup>
          <span class="text-800">
            @for (player of node.data.players; track player.player_id) {
              {{ player.display_name }}
            }
          </span>
        </div>
      </ng-template>
    </p-tree>
  `,
  styles: `
    :host ::ng-deep {
      .p-tree-toggler {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TreeModule, AvatarModule, AvatarGroupModule],
})
export class TournamentBracketComponent {
  private readonly eventService = inject(EventService);

  private readonly eventTeams = computed(() =>
    this.eventService
      .eventTeamsWithPlayerUserInfo()
      ?.filter((eventTeam) => eventTeam.event_id === this.eventId()),
  );

  readonly eventId = input.required<number>();

  readonly bracket = computed(() => this.generateBracket(this.eventTeams()));
  readonly selectedNodes: TreeNode[] = [];

  generateBracket(
    eventTeams: EventTeamModel[] | undefined,
  ): TreeNode<Partial<EventTeamModel>>[] {
    console.dir(eventTeams);
    if (!eventTeams) {
      return [{}];
    }

    const nodeTemplate = { expanded: true, type: 'node' };
    const bracket = this.generateBracketRecursively(
      { data: { seed: 1 } },
      eventTeams.length,
      1,
      eventTeams,
      nodeTemplate,
      false,
    );
    return [bracket];
  }

  generateBracketRecursively(
    parentNode: TreeNode<Partial<EventTeamModel>>,
    numberOfTeams: number,
    numberOfTeamsInRound: number,
    eventTeams: EventTeamModel[],
    nodeTemplate: TreeNode,
    isLowSeed: boolean,
  ): TreeNode<Partial<EventTeamModel>> {
    const bracketNode: TreeNode<Partial<EventTeamModel>> = {
      ...nodeTemplate,
      data: {
        seed: isLowSeed
          ? parentNode.data!.seed
          : numberOfTeamsInRound + 1 - parentNode.data!.seed!,
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

  setMatchWinner(
    ev: TreeNodeSelectEvent,
    bracket: TreeNode<Partial<EventTeamModel>>[],
    selectedNodes: TreeNode<Partial<EventTeamModel>>[],
  ) {
    const parent = this.getNodeParent(ev.node, bracket[0]);

    if (parent) {
      parent.data = ev.node.data;
    }

    const sibling = parent?.children?.find((child) => child !== ev.node);

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
}
