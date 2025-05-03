import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface GameboardSpaceVisualizationModel {
  icon_class: string | null;
  color: string;
}

@Component({
  selector: 'joshies-gameboard-space',
  imports: [],
  template: '',
  host: {
    '[class]':
      "model().icon_class + ' size-8 self-start shrink-0 rounded-full border-2 border-gray-300 text-lg text-gray-300 flex! justify-center items-center'",
    '[style.background]': 'model().color',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameboardSpaceComponent {
  model = input.required<GameboardSpaceVisualizationModel>();
}
