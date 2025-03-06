import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { pagePaddingXCssClass } from '../util/css-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map } from 'rxjs';

@Component({
  selector: 'joshies-page-header',
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Small Header Container -->
    <div
      class="h-5.75rem mt-0 flex justify-content-between align-items-center fixed top-0 left-0 mb-0 pt-6 w-full z-4 border-bottom-1"
      [ngClass]="[pagePaddingXCssClass, smallHeaderContainerDynamicClasses()]"
    >
      <!-- Small Header -->
      <p
        class="transition-duration-200 text-center w-full absolute left-0 m-0 font-semibold"
        [ngClass]="smallHeaderDynamicClasses()"
      >
        {{ headerText() }}
      </p>

      <!-- Other Header Content -->
      <div class="z-5 flex w-full">
        <ng-content />
      </div>
    </div>

    <!-- Spacer -->
    <div [ngClass]="spacerDynamicClasses()"></div>

    @if (!alwaysSmall()) {
      <!-- Large Header -->
      <h1
        class="mt-0 flex justify-content-between align-items-start w-full"
        [ngClass]="largeHeaderDynamicClasses()"
      >
        {{ headerText() }}
      </h1>
    }
  `,
})
export class PageHeaderComponent {
  headerText = input.required<string>();
  alwaysSmall = input(false, { transform: booleanAttribute });

  protected readonly pagePaddingXCssClass = pagePaddingXCssClass;

  private readonly pageIsScrolledBeyondTop = toSignal(
    fromEvent(document, 'scroll').pipe(map(() => pageIsScrolledBeyond(16))),
    { initialValue: pageIsScrolledBeyond(16) },
  );

  private readonly pageIsScrolledBeyondLargeHeader = toSignal(
    fromEvent(document, 'scroll').pipe(map(() => pageIsScrolledBeyond(32))),
    { initialValue: pageIsScrolledBeyond(32) },
  );

  private readonly inSmallMode = computed(() =>
    this.alwaysSmall() ? true : this.pageIsScrolledBeyondLargeHeader(),
  );

  readonly smallHeaderDynamicClasses = computed(() =>
    this.inSmallMode() ? 'opacity-100' : 'opacity-0',
  );

  readonly smallHeaderContainerDynamicClasses = computed(() =>
    this.inSmallMode() && this.pageIsScrolledBeyondTop()
      ? 'surface-border blur-background bg-header-footer-alpha'
      : 'border-transparent surface-ground',
  );

  readonly largeHeaderDynamicClasses = computed(() =>
    this.inSmallMode() ? 'opacity-0' : 'opacity-100',
  );

  readonly spacerDynamicClasses = computed(() =>
    this.alwaysSmall() ? 'h-3.25rem' : 'h-4.25rem',
  );
}

function pageIsScrolledBeyond(pixels: number): boolean {
  return document.documentElement.scrollTop > pixels;
}
