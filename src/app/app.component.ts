import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { pagePaddingXCssClass } from './shared/util/css-helpers';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'joshies-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast
      [life]="5000"
      [breakpoints]="{ '420px': { width: '95vw' } }"
      position="top-center"
      styleClass="mt-5"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly renderer = inject(Renderer2);
  private readonly primeNgConfig = inject(PrimeNGConfig);

  ngOnInit(): void {
    this.renderer.addClass(document.body, pagePaddingXCssClass);
    this.primeNgConfig.ripple = true;
  }
}
