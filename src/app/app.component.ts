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

@Component({
  selector: 'joshies-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast
      [breakpoints]="{ '420px': { width: '95vw' } }"
      position="top-center"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    this.renderer.addClass(document.body, pagePaddingXCssClass);
  }
}
