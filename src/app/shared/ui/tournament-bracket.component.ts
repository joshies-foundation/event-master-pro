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

@Component({
  selector: 'joshies-tournament-bracket',
  standalone: true,
  template: `
    <p-tree
      [value]="bracket()"
      layout="horizontal"
      [styleClass]="bracket().length ? 'rotate-180' : ''"
      selectionMode="checkbox"
      (onNodeSelect)="setMatchWinner($event, bracket()[0])"
      [(selection)]="selectedNodes"
      propagateSelectionUp="false"
      propagateSelectionDown="false"
    >
      <ng-template let-node pTemplate="node">
        <div class="flex align-items-center rotate-180 w-7rem h-2rem">
          <span class="text-sm text-400 mr-1">{{ node.data?.seed }}</span>
          <span class="text-800">{{ node.data?.name }}</span>
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
  imports: [TreeModule],
})
export class TournamentBracketComponent {
  private readonly eventService = inject(EventService);
  private readonly eventTeams = computed(() =>
    this.eventService
      .eventTeams()
      ?.filter((eventTeam) => eventTeam.event_id === this.eventId()),
  );

  readonly eventId = input.required<number>();

  readonly bracket = computed(() => this.generateBracket(this.eventTeams()));
  selectedNodes: TreeNode[] = [];

  generateBracket(
    eventTeams: EventTeamModel[] | undefined,
  ): TreeNode<Partial<EventTeamModel>>[] {
    const numberOfTeams = eventTeams?.length ?? 0;

    if (numberOfTeams === 0) return [];

    const numberOfTeamsInLargestFullRound = Math.pow(
      2,
      Math.floor(Math.log2(numberOfTeams)),
    );

    // use reverse() because bracket is flipped in component template
    const largestFullRoundSeedOrder = this.getSeedOrder(
      1,
      numberOfTeamsInLargestFullRound,
    ).reverse();

    const nodeTemplate = { expanded: true, type: 'node' };

    const bracket: TreeNode<Partial<EventTeamModel>>[] = Array(
      numberOfTeamsInLargestFullRound,
    )
      .fill(null)
      .map((node, index) => ({
        ...nodeTemplate,
        data: {
          ...eventTeams?.find(
            (eventTeam) => eventTeam.seed === largestFullRoundSeedOrder[index],
          ),
        },
      }));

    const numberOfPlayInTeams =
      2 * (numberOfTeams - numberOfTeamsInLargestFullRound); // "leftover" teams that don't fit into a perfect power-of-2 bracket

    if (numberOfPlayInTeams > 0) {
      const playInLowSeed = numberOfTeams - numberOfPlayInTeams + 1;
      const playInSeedOrder = this.getSeedOrder(playInLowSeed, numberOfTeams);
      let highestAvailableSeed = numberOfTeamsInLargestFullRound;

      while (playInSeedOrder.length > 0) {
        const highestAvailableNode = bracket.find(
          (node) => node.data!.seed === highestAvailableSeed,
        );

        highestAvailableNode!.children = [
          {
            ...nodeTemplate,
            data: {
              ...eventTeams?.find(
                (eventTeam) =>
                  eventTeam.seed ===
                  playInSeedOrder[playInSeedOrder.length - 1],
              ),
            },
          },
          {
            ...nodeTemplate,
            data: {
              ...eventTeams?.find(
                (eventTeam) =>
                  eventTeam.seed ===
                  playInSeedOrder[playInSeedOrder.length - 2],
              ),
            },
          },
        ];

        playInSeedOrder.pop();
        playInSeedOrder.pop();

        delete highestAvailableNode!.data;
        highestAvailableSeed--;
      }
    }

    while (bracket.length > 1) {
      const bracketLength = bracket.length;

      for (let node = 0; node < bracketLength / 2; node++) {
        const newNode = {
          ...nodeTemplate,
          children: [bracket.shift()!, bracket.shift()!],
        };

        bracket.push(newNode);
      }
    }

    return bracket;
  }

  getSeedOrder(lowSeed: number, highSeed: number) {
    const numberOfTeams = highSeed - lowSeed + 1;

    if (numberOfTeams % 2 !== 0 && numberOfTeams !== 1) {
      throw new Error(
        `Unable to get seed order for seeds ${lowSeed} to ${highSeed} because there are an uneven number of teams.`,
      );
    }

    const seedOrder = [];

    for (let seed = lowSeed; seed <= highSeed; seed++) {
      seedOrder.push([seed]);
    }

    while (seedOrder.length > 1) {
      const seedOrderLength = seedOrder.length;

      for (
        let seedGroupIndex = 0;
        seedGroupIndex < Math.floor(seedOrderLength / 2);
        seedGroupIndex++
      ) {
        seedOrder[seedGroupIndex].push(...seedOrder.pop()!.reverse());
      }
    }

    return seedOrder[0];
  }

  setMatchWinner(ev: TreeNodeSelectEvent, bracket: TreeNode) {
    const parent = this.getNodeParent(ev.node, bracket);

    if (parent) {
      parent.data = ev.node.data;
    }

    const sibling = parent?.children?.find((child) => child !== ev.node);

    const siblingIndex =
      this.selectedNodes.findIndex((node) => node === sibling) ?? -1;

    if (siblingIndex !== -1) {
      this.selectedNodes.splice(siblingIndex, 1);
    }
  }

  getNodeParent(node: TreeNode, rootNode: TreeNode): TreeNode | undefined {
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
