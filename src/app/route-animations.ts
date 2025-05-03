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
  background: 'var(--color-app-background-color)',
};

const layerCommonStyles: Record<string, string | number> = {
  ...slideCommonStyles,
  padding: `${pagePaddingYCssAmount} ${pagePaddingXCssAmount}`,
};

const addLayerAnimationTiming = '200ms cubic-bezier(.1,.25,.25,1)';
const removeLayerAnimationTiming = '100ms';

function addLayer(): AnimationMetadata[] {
  return [
    group([
      query(
        ':leave',
        [
          style({
            ...layerCommonStyles,
            transform: 'translate3d(0, 0, 0)',
          }),
          animate(
            addLayerAnimationTiming,
            style({ transform: 'translate3d(-20%, 0, 0)' }),
          ),
        ],
        { optional: true },
      ),
      query(
        ':enter',
        [
          style({
            ...layerCommonStyles,
            transform: 'translate3d(100%, 0, 0)',
            opacity: 0,
          }),
          animate(
            addLayerAnimationTiming,
            style({ transform: 'translate3d(0, 0, 0)', opacity: 1 }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ];
}

function removeLayer(): AnimationMetadata[] {
  return [
    group([
      query(
        ':leave',
        [
          style({
            ...layerCommonStyles,
            transform: 'translate3d(0, 0, 0)',
            opacity: 1,
            ['z-index']: 5,
          }),
          animate(
            removeLayerAnimationTiming,
            style({ transform: 'translate3d(100%, 0, 0)', opacity: 0.6 }),
          ),
        ],
        { optional: true },
      ),
      query(
        ':enter',
        [
          style({
            ...layerCommonStyles,
            transform: 'translate3d(-20%, 0, 0)',
          }),
          animate(
            removeLayerAnimationTiming,
            style({ transform: 'translate3d(0%, 0, 0)' }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ];
}

function slideFrom(direction: 'left' | 'right'): AnimationMetadata[] {
  return [
    group([
      query(
        ':leave',
        [
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
        ],
        { optional: true },
      ),
      query(
        ':enter',
        [
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
        ],
        { optional: true },
      ),
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
