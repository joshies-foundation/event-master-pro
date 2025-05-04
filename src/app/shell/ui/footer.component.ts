import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FooterLinkComponent, FooterLinkModel } from './footer-link.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge } from 'rxjs';
import { notifyOnMutation } from '../../shared/util/rxjs-helpers';

@Component({
  selector: 'joshies-footer',
  imports: [FooterLinkComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Spacer -->
    <div class="h-24"></div>

    <!-- Disabled Cover -->
    @if (disabled()) {
      <div
        class="fixed bottom-0 left-0 z-60 h-20 w-full bg-app-background-color/70"
      ></div>
    }

    <!-- Footer -->
    <nav
      class="fixed bottom-0 left-0 z-50 grid h-20 w-full auto-cols-fr grid-flow-col grid-rows-1 border-t pb-6 text-center"
      [ngClass]="dynamicClasses()"
    >
      @for (footerLink of footerLinks(); track footerLink.href) {
        <joshies-footer-link class="grow basis-0 p-2" [model]="footerLink" />
      }
    </nav>
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
      : 'border-standard-border-color blur-background bg-header-footer-alpha',
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
