import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';
import { BetType } from '../../shared/util/supabase-helpers';
import {
  DuelModel,
  SpecialSpaceEventModel,
} from '../../shared/util/supabase-types';

export function generateBetDetails(
  betType: BetType,
  duel?: DuelModel | null,
  winner?: PlayerWithUserAndRankInfo | null,
  ssEvent?: SpecialSpaceEventModel | null | undefined,
  ouOption?: 'Over' | 'Under',
  ouValue?: number,
): BetDetails {
  switch (betType) {
    case BetType.DuelWinner:
      return {
        duelId: duel?.id ?? 0,
        challengerWins: winner?.player_id === duel?.challenger?.player_id,
      };
    case BetType.SpecialSpaceEvent:
      return {
        ssEventId: ssEvent?.id ?? 0,
        directionIsOver: ouOption === 'Over',
        ouValue: ouValue ?? 0.5,
      };
    default:
      return {};
  }
}

export function generateBetDescription(
  betType: BetType,
  duel?: DuelModel | null,
  winner?: PlayerWithUserAndRankInfo | null,
  ssEvent?: SpecialSpaceEventModel | null | undefined,
  ouOption?: 'Over' | 'Under',
  ouValue?: number,
  terms: string = '',
) {
  switch (betType) {
    case BetType.DuelWinner:
      const loserName =
        winner?.player_id === duel?.challenger?.player_id
          ? duel?.opponent?.display_name
          : duel?.challenger?.display_name;
      return (
        winner?.display_name + ' beats ' + loserName + ' in ' + duel?.game_name
      );
    case BetType.SpecialSpaceEvent:
      return (
        ouOption +
        ' ' +
        ouValue +
        ' in ' +
        ssEvent?.player?.display_name +
        "'s " +
        ssEvent?.template?.name +
        ' Event'
      );
    default:
      return terms;
  }
}

export function generateBetTypeObject(type: BetType) {
  switch (type) {
    case BetType.DuelWinner:
      return { betType: type, betTypeString: 'Duel Winner' };
    case BetType.SpecialSpaceEvent:
      return {
        betType: type,
        betTypeString: 'Special Space Event Over/Under',
      };
    default:
      return { betType: BetType.Manual, betTypeString: 'Manual' };
  }
}

type DuelWinnerBetDetails = {
  duelId: DuelModel['id'];
  challengerWins: boolean;
};

type SpecialSpaceEventBetDetails = {
  ssEventId: SpecialSpaceEventModel['id'];
  directionIsOver: boolean;
  ouValue: number;
};

type BetDetails<T extends BetType = BetType> = T extends BetType.DuelWinner
  ? DuelWinnerBetDetails
  : T extends BetType.SpecialSpaceEvent
    ? SpecialSpaceEventBetDetails
    : Record<string, never>;
