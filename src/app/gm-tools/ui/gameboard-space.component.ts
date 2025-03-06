import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
} from '@angular/core';

interface GameboardSpaceVisualizationModel {
  icon_class: string | null;
  color: string;
}

@Component({
  selector: 'joshies-gameboard-space',
  imports: [],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameboardSpaceComponent {
  model = input.required<GameboardSpaceVisualizationModel>();

  @HostBinding('class') get hostClass(): string {
    return `${this.model().icon_class} h-2rem align-self-start flex-shrink-0 w-2rem border-circle border-2 border-gray-300 text-lg text-gray-300 flex justify-content-center align-items-center`;
  }

  @HostBinding('style') get hostStyle(): string {
    return `background: ${this.model().color}`;
  }
}
