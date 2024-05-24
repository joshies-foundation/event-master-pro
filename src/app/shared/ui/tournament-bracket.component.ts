import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { EventTeamModel } from '../util/supabase-types';

@Component({
  selector: 'joshies-tournament-bracket',
  standalone: true,
  template: `
    <p-tree
      [value]="bracket()"
      layout="horizontal"
      styleClass="rotate-180"
      selectionMode="multiple"
    >
      <ng-template let-node pTemplate="node">
        <div class="flex align-items-center rotate-180 w-5rem h-2rem">
          {{ node.data?.seed }}
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
  readonly numberOfTeams = input.required<number>();
  readonly bracket = computed(() => this.generateBracket(this.numberOfTeams()));

  generateBracket(numberOfTeams: number): TreeNode<Partial<EventTeamModel>>[] {
    const numberOfTeamsInLargestFullRound = Math.pow(
      2,
      Math.floor(Math.log2(numberOfTeams)),
    );

    // use reverse because bracket is flipped in component template
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
        label: 'Team ' + Math.round(Math.random() * 100),
        data: {
          seed: largestFullRoundSeedOrder[index],
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
            label: 'Team ' + Math.round(Math.random() * 100),
            data: { seed: playInSeedOrder.pop()! },
          },
          {
            ...nodeTemplate,
            label: 'Team ' + Math.round(Math.random() * 100),
            data: { seed: playInSeedOrder.pop()! },
          },
        ];
        delete highestAvailableNode!.data!.seed;
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

    if (numberOfTeams % 2 !== 0) {
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
}
