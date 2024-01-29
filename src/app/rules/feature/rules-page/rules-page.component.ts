import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RulesService } from '../../data-access/rules.service';

@Component({
  selector: 'joshies-rules-page',
  standalone: true,
  imports: [],
  templateUrl: './rules-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RulesPageComponent {
  private readonly rulesService = inject(RulesService);

  readonly rules = this.rulesService.rules;
}
