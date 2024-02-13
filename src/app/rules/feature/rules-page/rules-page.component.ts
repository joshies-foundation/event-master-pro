import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RulesService } from '../../data-access/rules.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'joshies-rules-page',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './rules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RulesPageComponent {
  private readonly rulesService = inject(RulesService);

  readonly rules = this.rulesService.rules;
}
