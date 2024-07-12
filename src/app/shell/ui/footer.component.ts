import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterLinkComponent, FooterLinkModel } from './footer-link.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge } from 'rxjs';
import { notifyOnMutation } from '../../shared/util/rxjs-helpers';

@Component({
  selector: 'joshies-footer',
  standalone: true,
  imports: [CommonModule, FooterLinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Spacer -->
    <div class="h-6rem"></div>

    <!-- Disabled Cover -->
    @if (disabled()) {
      <div
        class="surface-alpha-70 w-full h-5rem fixed z-6 bottom-0 left-0"
      ></div>
    }

    <!-- Footer -->
    <nav
      class="w-full h-5rem border-top-1 flex justify-between fixed z-5 bottom-0 left-0 pb-4 text-center"
      [ngClass]="dynamicClasses()"
    >
      @for (footerLink of footerLinks(); track footerLink.href) {
        <joshies-footer-link class="col" [model]="footerLink" />
      }
    </nav>
  `,
  styles: `
    ::ng-deep .p-badge {
      min-width: 1rem;
      height: 1rem;
      line-height: 1.05rem;
    }
  `,
})
export class FooterComponent {
  footerLinks = input.required<FooterLinkModel[]>();
  disabled = input(false, { transform: booleanAttribute });

  private readonly isScrolledToBottom = toSignal(
    merge(
      fromEvent(document, 'scroll'),
      fromEvent(window, 'resize'),
      notifyOnMutation(document.body, { childList: true, subtree: true }),
    ).pipe(map(pageIsScrolledToBottom)),
    { initialValue: pageIsScrolledToBottom() },
  );

  readonly dynamicClasses = computed(() =>
    this.isScrolledToBottom()
      ? 'border-transparent'
      : 'surface-border blur-background bg-header-footer-alpha',
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
