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
      class="fixed top-0 left-0 z-40 mt-0 mb-0 flex h-23 w-full items-center justify-between border-b pt-12"
      [ngClass]="[pagePaddingXCssClass, smallHeaderContainerDynamicClasses()]"
    >
      <!-- Small Header -->
      <p
        class="absolute left-0 w-full text-center font-semibold duration-200"
        [ngClass]="smallHeaderDynamicClasses()"
      >
        {{ headerText() }}
      </p>

      <!-- Other Header Content -->
      <div class="z-50 flex w-full">
        <ng-content />
      </div>
    </div>

    <!-- Spacer -->
    <div [ngClass]="spacerDynamicClasses()"></div>

    @if (!alwaysSmall()) {
      <!-- Large Header -->
      <h1
        class="mb-5 flex w-full items-start justify-between text-[2rem] font-bold"
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
      ? 'border-standard-border-color blur-background bg-header-footer-alpha'
      : 'border-transparent bg-app-background-color',
  );

  readonly largeHeaderDynamicClasses = computed(() =>
    this.inSmallMode() ? 'opacity-0' : 'opacity-100',
  );

  readonly spacerDynamicClasses = computed(() =>
    this.alwaysSmall() ? 'h-13' : 'h-17',
  );
}

function pageIsScrolledBeyond(pixels: number): boolean {
  return document.documentElement.scrollTop > pixels;
}
