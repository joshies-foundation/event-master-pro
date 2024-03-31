import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FooterLinkComponent,
  FooterLinkModel,
} from '../ui/footer-link.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { delay, filter, fromEvent, map, merge } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'joshies-footer',
  standalone: true,
  imports: [CommonModule, FooterLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Spacer -->
    <div class="h-5rem mt-3"></div>

    <!-- Disabled Cover -->
    @if (disabled()) {
      <div
        class="bg-white-alpha-60 w-full h-5rem fixed z-5 bottom-0 left-0"
      ></div>
    }

    <!-- Footer -->
    <nav
      class="w-full h-5rem border-top-1 flex justify-between fixed bottom-0 left-0 pb-4 text-center"
      [ngClass]="dynamicClasses()"
    >
      @for (footerLink of footerLinks(); track footerLink.href) {
        <joshies-footer-link class="col" [model]="footerLink" />
      }
    </nav>
  `,
})
export class FooterComponent {
  footerLinks = input.required<FooterLinkModel[]>();
  disabled = input(false, { transform: booleanAttribute });

  private readonly router = inject(Router);

  private readonly isScrolledToBottom = toSignal(
    merge(
      fromEvent(document, 'scroll'),
      fromEvent(window, 'resize'),
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
        delay(0),
      ),
    ).pipe(map(pageIsScrolledToBottom)),
    { initialValue: pageIsScrolledToBottom() },
  );

  readonly dynamicClasses = computed(() =>
    this.isScrolledToBottom()
      ? 'border-transparent'
      : 'border-200 blur-background bg-white-alpha-80',
  );

  readonly largeHeaderDynamicClasses = computed(() =>
    this.isScrolledToBottom() ? 'opacity-0' : 'opacity-100',
  );
}

function pageIsScrolledToBottom(): boolean {
  return (
    window.innerHeight + Math.round(document.documentElement.scrollTop) >=
    document.documentElement.scrollHeight - 16
  );
}
