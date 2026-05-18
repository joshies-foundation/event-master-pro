import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import OverridePointsCardComponent from '../ui/override-points-card.component';

@Component({
  selector: 'joshies-override-points-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    SkeletonModule,
    FormsModule,
    RadioButtonModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    OverridePointsCardComponent,
  ],
  template: `
    <joshies-page-header headerText="Override Points" alwaysSmall>
      <joshies-header-link
        text="Cancel"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <joshies-override-points-card
      [playerId]="playerId()"
      (complete)="onComplete()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverridePointsPageComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly playerId = input(0, { transform: numberAttribute }); // route param

  onComplete() {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute }).then();
  }
}
