import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { pagePaddingXCssClass } from './shared/util/css-helpers';
import { PrimeNG } from 'primeng/config';
import { SquidwardService } from './shared/data-access/squidward.service';

@Component({
  selector: 'joshies-root',
  imports: [CommonModule, RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast
      [life]="5000"
      [breakpoints]="{ '420px': { width: '95vw' } }"
      position="top-center"
      styleClass="mt-8"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly renderer = inject(Renderer2);
  private readonly primeNg = inject(PrimeNG);

  // required to start squidward mode
  private readonly squidwardService = inject(SquidwardService);

  ngOnInit(): void {
    this.renderer.addClass(document.body, pagePaddingXCssClass);
    this.primeNg.ripple.set(true);
  }
}
