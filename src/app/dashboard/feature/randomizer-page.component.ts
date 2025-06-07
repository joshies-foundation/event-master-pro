import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import {
  ChaosSpaceEffectData,
  DuelSpaceEffectData,
  GameboardSpaceModel,
  SpecialSpaceEffectData,
} from '../../shared/util/supabase-types';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import RandomizerComponent from '../ui/randomizer.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PlayerService } from '../../shared/data-access/player.service';

@Component({
  selector: 'joshies-randomizer-page',
  template: `
    <div class="randomizer-container">
      <div class="mb-auto flex flex-col gap-2">
        <label class="flex items-center gap-2">
          <p-radioButton name="type" value="Special" [(ngModel)]="type" />
          <span class="w-[180px]">Special Space Events</span>
          <p-select
            placeholder="Special Spaces"
            [options]="specialSpaces()"
            optionLabel="name"
            [(ngModel)]="selectedSpecialSpace"
            class="w-xs"
            [class.hidden]="specialSpaces().length < 2"
          />
        </label>
        <label class="flex items-center gap-2">
          <p-radioButton name="type" value="Duel" [(ngModel)]="type" />
          <span class="w-[180px]">Duel Space Games</span>
          <p-select
            placeholder="Duel Spaces"
            [options]="duelSpaces()"
            optionLabel="name"
            [(ngModel)]="selectedDuelSpace"
            class="w-xs"
            [class.hidden]="duelSpaces().length < 2"
          />
        </label>
        <label class="flex items-center gap-2">
          <p-radioButton name="type" value="Chaos" [(ngModel)]="type" />
          <span class="w-[180px]">Chaos Space Events</span>
          <p-select
            placeholder="Chaos Spaces"
            [options]="chaosSpaces()"
            optionLabel="name"
            [(ngModel)]="selectedChaosSpace"
            class="w-xs"
            [class.hidden]="chaosSpaces().length < 2"
          />
        </label>
        <label class="flex items-center gap-2">
          <p-radioButton name="type" value="Player" [(ngModel)]="type" />
          <span class="w-[180px]">Players</span>
        </label>
      </div>
      <joshies-randomizer class="w-full" [items]="options()" />
    </div>
  `,
  styles: [
    `
      .randomizer-container {
        display: grid;
        grid-template-rows: 1fr auto 1fr;
        grid-row-gap: 5px;
        justify-items: center;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  imports: [Select, FormsModule, RandomizerComponent, RadioButtonModule],
})
export default class RandomizerPageComponent {
  private readonly gameboardService = inject(GameboardService);
  private readonly playerService = inject(PlayerService);
  private readonly specialSpaceEventTemplates = toSignal(
    this.gameboardService.specialSpaceEventTemplates$,
  );
  private readonly gameboardSpaces = toSignal(
    this.gameboardService.gameboardSpaces$,
  );
  private readonly chaosSpaceEventTemplates = toSignal(
    this.gameboardService.chaosSpaceEventTemplates$,
  );

  readonly type = signal<'Special' | 'Chaos' | 'Duel'>('Special'); // TODO: Add Chaos and Duel types
  readonly selectedSpecialSpace = signal<GameboardSpaceModel | null>(null);
  readonly selectedDuelSpace = signal<GameboardSpaceModel | null>(null);
  readonly selectedChaosSpace = signal<GameboardSpaceModel | null>(null);

  readonly specialSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return spaces?.filter((space) => space.effect === 'special') || [];
  });

  readonly duelSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return spaces?.filter((space) => space.effect === 'duel') || [];
  });

  readonly chaosSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return spaces?.filter((space) => space.effect === 'chaos') || [];
  });

  readonly players = computed(() => {
    const players = this.playerService.players();
    return players?.map((player) => player.display_name) || [];
  });

  private readonly specialSpaceEvents = computed(() => {
    const selectedSpecialSpace = this.selectedSpecialSpace();
    const effectData = selectedSpecialSpace?.effect_data as
      | SpecialSpaceEffectData
      | undefined;
    const eventTemplates = this.specialSpaceEventTemplates();

    return (
      eventTemplates
        ?.filter((template) =>
          effectData?.specialSpaceEventTemplateIds?.includes(template.id),
        )
        .map((template) => template.name) || []
    );
  });

  private readonly duelGames = computed(() => {
    const selectedDuelSpace = this.selectedDuelSpace();
    return (
      (selectedDuelSpace?.effect_data as DuelSpaceEffectData)?.duelGames || []
    );
  });

  private readonly chaosEvents = computed(() => {
    const selectedChaosSpace = this.selectedChaosSpace();
    const effectData = selectedChaosSpace?.effect_data as
      | ChaosSpaceEffectData
      | undefined;
    const chaosSpaceEventTemplates = this.chaosSpaceEventTemplates();

    return (
      chaosSpaceEventTemplates
        ?.filter((template) =>
          effectData?.chaosSpaceEventTemplateIds?.includes(template.id),
        )
        .map((template) => template.name) || []
    );
  });

  readonly options = computed(() => {
    const type = this.type();
    const specialSpaceEvents = this.specialSpaceEvents();
    if (type === 'Special') {
      return specialSpaceEvents;
    }
    if (type === 'Duel') {
      return this.duelGames();
    }
    if (type === 'Chaos') {
      return this.chaosEvents();
    }
    if (type === 'Player') {
      return this.players();
    }

    return [];
  });

  constructor() {
    effect(() => {
      const specialSpaces = this.specialSpaces();
      if (specialSpaces && specialSpaces.length > 0) {
        this.selectedSpecialSpace.set(specialSpaces[0]);
      }
    });
    effect(() => {
      const duelSpaces = this.duelSpaces();
      if (duelSpaces && duelSpaces.length > 0) {
        this.selectedDuelSpace.set(duelSpaces[0]);
      }
    });
    effect(() => {
      const chaosSpaces = this.chaosSpaces();
      if (chaosSpaces && chaosSpaces.length > 0) {
        this.selectedChaosSpace.set(chaosSpaces[0]);
      }
    });
  }
}
