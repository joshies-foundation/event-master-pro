import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
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
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';

enum RandomizerOption {
  Special = 'Special',
  Chaos = 'Chaos',
  Duel = 'Duel',
  Player = 'Player',
}

@Component({
  selector: 'joshies-randomizer-page',
  template: `
    <div class="mb-auto flex flex-col gap-2">
      <joshies-page-header headerText="Randomizer" alwaysSmall class="mb-3">
        <joshies-header-link
          text="Dashboard"
          routerLink=".."
          chevronDirection="left"
        />
      </joshies-page-header>

      <!-- Randomizer Options -->
      <!-- If there's multiple flavors for an option, include a dropdown -->

      <!-- First row of options -->
      <div class="flex flex-row gap-2">
        <label class="flex items-center gap-2">
          <p-radio-button
            name="type"
            [value]="RandomizerOptions.Special"
            [(ngModel)]="type"
          />
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
          <p-radio-button
            name="type"
            [value]="RandomizerOptions.Duel"
            [(ngModel)]="type"
          />
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
      </div>

      <!-- Second row of options -->
      <div class="flex flex-row gap-2">
        <label class="flex items-center gap-2">
          <p-radio-button
            name="type"
            [value]="RandomizerOptions.Chaos"
            [(ngModel)]="type"
          />
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
          <p-radio-button
            name="type"
            [value]="RandomizerOptions.Player"
            [(ngModel)]="type"
          />
          <span class="w-[180px]">Players</span>
        </label>
      </div>
    </div>
    <joshies-randomizer class="w-full" [items]="options()" />
  `,
  host: {
    class: 'grid grid-rows-[1fr_auto_1fr] gap-1 justify-items-center size-full',
  },
  imports: [
    Select,
    FormsModule,
    RandomizerComponent,
    RadioButtonModule,
    PageHeaderComponent,
    HeaderLinkComponent,
  ],
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

  readonly RandomizerOptions = RandomizerOption;
  readonly type = signal<RandomizerOption>(RandomizerOption.Special);

  readonly selectedSpecialSpace = linkedSignal<GameboardSpaceModel | null>(
    () => {
      const specialSpaces = this.specialSpaces();
      if (specialSpaces && specialSpaces.length > 0) {
        return specialSpaces[0];
      }
      return null;
    },
  );

  readonly selectedDuelSpace = linkedSignal<GameboardSpaceModel | null>(() => {
    const duelSpaces = this.duelSpaces();
    if (duelSpaces && duelSpaces.length > 0) {
      return duelSpaces[0];
    }
    return null;
  });

  readonly selectedChaosSpace = linkedSignal<GameboardSpaceModel | null>(() => {
    const chaosSpaces = this.chaosSpaces();
    if (chaosSpaces && chaosSpaces.length > 0) {
      return chaosSpaces[0];
    }
    return null;
  });

  readonly specialSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return (
      spaces?.filter(
        (space) => space.effect === GameboardSpaceEffect.Special,
      ) || []
    );
  });

  readonly duelSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return (
      spaces?.filter((space) => space.effect === GameboardSpaceEffect.Duel) ||
      []
    );
  });

  readonly chaosSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return (
      spaces?.filter((space) => space.effect === GameboardSpaceEffect.Chaos) ||
      []
    );
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
    const duelGames = this.duelGames();
    const chaosEvents = this.chaosEvents();
    const players = this.players();

    switch (type) {
      case RandomizerOption.Special:
        return specialSpaceEvents;
      case RandomizerOption.Chaos:
        return chaosEvents;
      case RandomizerOption.Duel:
        return duelGames;
      case RandomizerOption.Player:
        return players;
    }
  });
}
