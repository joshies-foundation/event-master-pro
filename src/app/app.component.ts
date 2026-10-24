import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from '@openng/optimus-ui/toast';
import { pagePaddingXCssClass } from './shared/util/css-helpers';
import { SquidwardService } from './shared/data-access/squidward.service';

@Component({
  selector: 'joshies-root',
  imports: [RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast
      [life]="5000"
      [breakpoints]="{ '420px': { width: '95vw' } }"
      position="top-center"
      class="mt-8"
    />
  `,
})
export class AppComponent implements OnInit {
  private readonly renderer = inject(Renderer2);

  // required to start squidward mode
  private readonly squidwardService = inject(SquidwardService);

  ngOnInit(): void {
    this.renderer.addClass(document.body, pagePaddingXCssClass);
  }
}
