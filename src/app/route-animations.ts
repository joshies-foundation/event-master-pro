import {
  trigger,
  transition,
  style,
  query,
  animate,
  AnimationMetadata,
  group,
} from '@angular/animations';
import {
  pagePaddingXCssAmount,
  pagePaddingYCssAmount,
} from './shared/util/css-helpers';

const slideCommonStyles: Record<string, string | number> = {
  position: 'absolute',
  'z-index': 4,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  background: 'var(--surface-card)',
};

const layerCommonStyles: Record<string, string | number> = {
  ...slideCommonStyles,
  padding: `${pagePaddingYCssAmount} ${pagePaddingXCssAmount}`,
};

function addLayer(): AnimationMetadata[] {
  return [
    query(':leave', style({ display: 'block' })),
    query(
      ':enter',
      [
        style({
          ...layerCommonStyles,
          transform: 'translate3d(100%, 0, 0)',
        }),
        animate(`250ms ease-out`, style({ transform: 'translate3d(0, 0, 0)' })),
      ],
      { optional: true },
    ),
  ];
}

function removeLayer(): AnimationMetadata[] {
  return [
    query(
      ':leave',
      [
        style({
          ...layerCommonStyles,
          transform: 'translate3d(0, 0, 0)',
        }),
        animate('200ms', style({ transform: 'translate3d(100%, 0, 0)' })),
      ],
      { optional: true },
    ),
    query(':enter', style('*')),
  ];
}

function slideFrom(direction: 'left' | 'right'): AnimationMetadata[] {
  return [
    group([
      query(':leave', [
        style({
          ...slideCommonStyles,
          transform: `translate3d(0, 0, 0)`,
        }),
        animate(
          '200ms ease-out',
          style({
            transform: `translate3d(calc(${direction === 'left' ? '100% + ' + pagePaddingXCssAmount : '-100% - ' + pagePaddingXCssAmount}), 0, 0)`,
          }),
        ),
      ]),
      query(':enter', [
        style({
          ...slideCommonStyles,
          transform: `translate3d(calc(${direction === 'left' ? '-100% - ' + pagePaddingXCssAmount : '100% + ' + pagePaddingXCssAmount}), 0, 0)`,
        }),
        animate(
          '200ms ease-out',
          style({
            transform: `translate3d(0, 0, 0)`,
          }),
        ),
      ]),
    ]),
  ];
}

export const layerPages = trigger('routeAnimations', [
  transition(':increment', addLayer()),
  transition(':decrement', removeLayer()),
]);

export const slidePages = trigger('routeAnimations', [
  transition(':increment', slideFrom('right')),
  transition(':decrement', slideFrom('left')),
]);
