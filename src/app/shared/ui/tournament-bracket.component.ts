import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';

@Component({
  selector: 'joshies-tournament-bracket',
  standalone: true,
  template: `
    <p-tree [value]="bracket()" layout="horizontal" styleClass="rotate-180">
      <ng-template let-node pTemplate="node">
        <div class="flex align-items-center rotate-180 w-5rem h-2rem">
          {{ node.label }}
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

  generateBracket(numberOfTeams: number): TreeNode<number>[] {
    const numberOfRounds = Math.ceil(Math.log2(numberOfTeams));
    const numberOfPlayInTeams = 2 * numberOfTeams - Math.pow(2, numberOfRounds); // "leftover" teams that don't fit into a perfect power-of-2 bracket

    let bracket: TreeNode<number>[] = Array(numberOfPlayInTeams)
      .fill(null)
      .map((node, index) => ({
        label: numberOfRounds + '_' + index,
        expanded: true,
        type: 'node',
      }));

    for (let round = numberOfRounds - 1; round > 0; round--) {
      const newNodes = [] as TreeNode<number>[];

      for (let eventTeam = 0; eventTeam < Math.pow(2, round); eventTeam++) {
        const newNode: TreeNode<number> = {
          label: round + '_' + eventTeam,
          expanded: true,
          type: 'node',
        };

        if (bracket[0]) {
          newNode.children = [bracket.shift()!, bracket.shift()!];
        }

        newNodes.push(newNode);
      }

      bracket = newNodes;
    }

    return [
      { label: 'Champion', expanded: true, type: 'node', children: bracket },
    ];
  }
}
