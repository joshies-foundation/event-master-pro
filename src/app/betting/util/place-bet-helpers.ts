import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';
import { BetSubtype, BetType } from '../../shared/util/supabase-helpers';
import {
  ChaosSpaceEventModel,
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
  betSubtype?: BetSubtype,
  chaosEvent?: ChaosSpaceEventModel | null | undefined,
  chaosPlayer?: PlayerWithUserAndRankInfo | null,
  winsLoses?: 'Wins' | 'Loses',
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
    case BetType.ChaosSpaceEvent:
      if (betSubtype === BetSubtype.PlayerLoses) {
        return {
          chaosEventId: chaosEvent?.id ?? 0,
          subtype: BetSubtype.PlayerLoses,
          playerId: chaosPlayer?.player_id ?? 0,
          isLoser: winsLoses === 'Loses',
        };
      }
      if (betSubtype === BetSubtype.NumberOfLosers) {
        return {
          chaosEventId: chaosEvent?.id ?? 0,
          subtype: BetSubtype.NumberOfLosers,
          directionIsOver: ouOption === 'Over',
          ouValue: ouValue ?? 0.5,
        };
      }
      return {};
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
  betSubtype?: BetSubtype,
  chaosEvent?: ChaosSpaceEventModel | null | undefined,
  chaosPlayer?: PlayerWithUserAndRankInfo | null,
  winsLoses?: 'Wins' | 'Loses',
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
    case BetType.ChaosSpaceEvent:
      if (betSubtype === BetSubtype.PlayerLoses) {
        return (
          chaosPlayer?.display_name +
          ' ' +
          winsLoses +
          ' in the ' +
          chaosEvent?.template?.name +
          ' Event'
        );
      }
      if (betSubtype === BetSubtype.NumberOfLosers) {
        return (
          ouOption +
          ' ' +
          ouValue +
          ' losers in the ' +
          chaosEvent?.template?.name +
          ' Event'
        );
      }
      return '';
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
    case BetType.ChaosSpaceEvent:
      return {
        betType: type,
        betTypeString: 'Chaos Space Event',
      };
    case BetType.Custom:
      return {
        betType: type,
        betTypeString: 'Custom',
      };
  }
}

export function getBetType(typeString: string) {
  switch (typeString) {
    case 'duel':
      return BetType.DuelWinner;
    case 'chaos':
      return BetType.ChaosSpaceEvent;
    case 'special':
      return BetType.SpecialSpaceEvent;
    case 'event': //TODO
    case 'move': //TODO
    default:
      return BetType.Custom;
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

type ChaosSpaceEventBetDetails<T extends BetSubtype> =
  T extends BetSubtype.PlayerLoses
    ? ChaosSpaceEventPlayerLosesBetDetails
    : T extends BetSubtype.NumberOfLosers
      ? ChaosSpaceEventNummberOfLosersBetDetails
      : Record<string, never>;

type ChaosSpaceEventPlayerLosesBetDetails = {
  chaosEventId: ChaosSpaceEventModel['id'];
  subtype: BetSubtype.PlayerLoses;
  playerId: number;
  isLoser: boolean;
};

type ChaosSpaceEventNummberOfLosersBetDetails = {
  chaosEventId: ChaosSpaceEventModel['id'];
  subtype: BetSubtype.NumberOfLosers;
  directionIsOver: boolean;
  ouValue: number;
};

type BetDetails<T extends BetType = BetType> = T extends BetType.DuelWinner
  ? DuelWinnerBetDetails
  : T extends BetType.SpecialSpaceEvent
    ? SpecialSpaceEventBetDetails
    : T extends BetType.ChaosSpaceEvent
      ? ChaosSpaceEventBetDetails<BetSubtype>
      : Record<string, never>;
