import { inject, Pipe, PipeTransform } from '@angular/core';
import {
  DuelSpaceEffectData,
  GainPointsOrDoActivitySpaceEffectData,
  GainPointsSpaceEffectData,
  GameboardSpaceEffectWithData,
} from '../../shared/util/supabase-types';
import { GameboardSpaceEffect } from '../../shared/util/supabase-helpers';
import { TitleCasePipe } from '@angular/common';
import { LoseOrGainPipe } from './lose-or-gain.pipe';

@Pipe({
  name: 'gameboardSpaceDescription',
  standalone: true,
})
export class GameboardSpaceDescriptionPipe implements PipeTransform {
  private readonly loseOrGainPipe = inject(LoseOrGainPipe);
  private readonly titleCasePipe = inject(TitleCasePipe);

  transform(gameboardSpace: GameboardSpaceEffectWithData): string {
    switch (gameboardSpace.effect) {
      case GameboardSpaceEffect.GainPoints:
        return `${this.titleCasePipe.transform(this.loseOrGainPipe.transform((gameboardSpace.effect_data as GainPointsSpaceEffectData)?.pointsGained ?? '[Missing Data]'))} points`;

      case GameboardSpaceEffect.GainPointsOrDoActivity:
        return `
          <p >
            ${this.titleCasePipe.transform(this.loseOrGainPipe.transform((gameboardSpace.effect_data as GainPointsOrDoActivitySpaceEffectData)?.pointsGained ?? '[Missing Data]'))} points
          </p>
          <p class="my-1"><strong>OR</strong></p>
          <p >
            ${(gameboardSpace.effect_data as GainPointsOrDoActivitySpaceEffectData)?.alternativeActivity ?? '[Missing Data]'}
          </p>
        `;

      case GameboardSpaceEffect.Duel:
        return `
          <p >
            Randomly wager a percentage of your points and duel another player 1-on-1:
          </p>
          <ul class="pl-8 mt-1">
            ${(
              (gameboardSpace.effect_data as DuelSpaceEffectData)?.duelGames ??
              []
            ).reduce((prev, game) => prev + '<li>' + game + '</li>', '')}
          </ul>
        `;

      case GameboardSpaceEffect.Special:
        return `<p >Trigger a special event</p>`;
      // let specialEventsDescriptions = '<ul class="pl-5 mt-1">';
      //
      // (
      //   (gameboardSpace.effect_data as SpecialSpaceEffectData)
      //     ?.specialSpaceEventTemplateIds ?? []
      // ).forEach((event) => {
      //   specialEventsDescriptions += `<li>${event.name}<ul class="pl-4"><li class="text-400">`;
      //
      //   switch (event.effect.type) {
      //     case SpecialSpaceEventType.PlayerGainsPointsBasedOnGameScore:
      //       const { sessionPointsPerGamePoint, pointsLabelSingular } = event
      //         .effect
      //         .data as PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails;
      //
      //       specialEventsDescriptions += `${sessionPointsPerGamePoint} point${Math.abs(sessionPointsPerGamePoint) === 1 ? '' : 's'} per ${pointsLabelSingular}`;
      //       break;
      //
      //     case SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank:
      //       specialEventsDescriptions +=
      //         'Everyone gains points based on rank';
      //       break;
      //   }
      //
      //   specialEventsDescriptions += '</li></ul></li>';
      // });
      //
      // specialEventsDescriptions += '</ul>';
      //
      // return `
      //   <p >
      //     Trigger a special event:
      //   </p>
      //   ${specialEventsDescriptions}
      // `;

      case GameboardSpaceEffect.Chaos:
        return `<p >Trigger a chaotic event</p>`;

      case GameboardSpaceEffect.Bank:
        return `<p >Get all the points in the Bank</p>`;

      default:
        return `Unknown gameboard_space_effect: "${(gameboardSpace as { effect: string }).effect}"`;
    }
  }
}
