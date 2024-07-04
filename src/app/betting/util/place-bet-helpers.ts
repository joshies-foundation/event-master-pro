import { EventTeamWithParticipantInfo } from '../../shared/data-access/event.service';
import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';
import { getFormattedParticipantList } from '../../shared/util/event-helpers';
import { BetSubtype, BetType } from '../../shared/util/supabase-helpers';
import {
  ChaosSpaceEventModel,
  DuelModel,
  EventModel,
  EventTeamModel,
  SpecialSpaceEventModel,
} from '../../shared/util/supabase-types';

export function generateBetDetails(
  betType: BetType,
  duel: DuelModel | null,
  winner: PlayerWithUserAndRankInfo | null,
  ssEvent: SpecialSpaceEventModel | null | undefined,
  ouOption: 'Over' | 'Under',
  ouValue: number,
  chaosBetSubtype: BetSubtype,
  chaosEvent: ChaosSpaceEventModel | null | undefined,
  chaosPlayer: PlayerWithUserAndRankInfo | null,
  winsLoses: 'Wins' | 'Loses',
  eventTeam: EventTeamWithParticipantInfo | null,
  topBottomOption: 'Top' | 'Bottom',
  numberOfTeams: number,
  event: EventModel | null,
  eventBetSubtype: BetSubtype,
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
      if (chaosBetSubtype === BetSubtype.PlayerLoses) {
        return {
          chaosEventId: chaosEvent?.id ?? 0,
          subtype: BetSubtype.PlayerLoses,
          playerId: chaosPlayer?.player_id ?? 0,
          isLoser: winsLoses === 'Loses',
        };
      }
      if (chaosBetSubtype === BetSubtype.NumberOfLosers) {
        return {
          chaosEventId: chaosEvent?.id ?? 0,
          subtype: BetSubtype.NumberOfLosers,
          directionIsOver: ouOption === 'Over',
          ouValue: ouValue ?? 0.5,
        };
      }
      return {};
    case BetType.MainEvent:
      if (eventBetSubtype === BetSubtype.TeamPosition) {
        return {
          eventId: event?.id ?? 0,
          teamId: eventTeam?.id ?? 0,
          subtype: BetSubtype.TeamPosition,
          directionIsTop: topBottomOption === 'Top',
          numberOfTeams: numberOfTeams ?? 1,
        };
      }
      if (eventBetSubtype === BetSubtype.Score) {
        return {
          eventId: event?.id ?? 0,
          teamId: eventTeam?.id ?? 0,
          subtype: BetSubtype.Score,
          directionIsOver: ouOption === 'Over',
          ouValue: ouValue,
        };
      }
      return {};
    default:
      return {};
  }
}

export function generateBetDescription(
  betType: BetType,
  duel: DuelModel | null,
  winner: PlayerWithUserAndRankInfo | null,
  ssEvent: SpecialSpaceEventModel | null | undefined,
  ouOption: 'Over' | 'Under',
  ouValue: number,
  terms: string = '',
  chaosBetSubtype: BetSubtype,
  chaosEvent: ChaosSpaceEventModel | null | undefined,
  chaosPlayer: PlayerWithUserAndRankInfo | null,
  winsLoses: 'Wins' | 'Loses',
  team: EventTeamWithParticipantInfo | null,
  topBottomOption: 'Top' | 'Bottom',
  numberOfTeams: number,
  event: EventModel | null,
  eventBetSubtype: BetSubtype,
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
      if (chaosBetSubtype === BetSubtype.PlayerLoses) {
        return (
          chaosPlayer?.display_name +
          ' ' +
          winsLoses +
          ' in the ' +
          chaosEvent?.template?.name +
          ' Event'
        );
      }
      if (chaosBetSubtype === BetSubtype.NumberOfLosers) {
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
    case BetType.MainEvent:
      if (eventBetSubtype === BetSubtype.TeamPosition) {
        return (
          'Team' +
          getFormattedParticipantList(team?.participants) +
          ' finishes in the ' +
          topBottomOption +
          ' ' +
          numberOfTeams +
          ' teams in the ' +
          event?.name +
          ' Event'
        );
      }
      if (eventBetSubtype === BetSubtype.Score) {
        return (
          'Team' +
          getFormattedParticipantList(team?.participants) +
          ' scores ' +
          ouOption +
          ' ' +
          ouValue +
          ' in the ' +
          event?.name +
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
    case BetType.MainEvent:
      return {
        betType: type,
        betTypeString: 'Main Event',
      };
    case BetType.Custom:
      return {
        betType: type,
        betTypeString: 'Custom',
      };
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

type MainEventBetDetails<T extends BetSubtype> =
  T extends BetSubtype.TeamPosition
    ? MainEventTeamPositionBetDetails
    : T extends BetSubtype.Score
      ? MainEventScoreBetDetails
      : Record<string, never>;

type MainEventTeamPositionBetDetails = {
  eventId: EventModel['id'];
  teamId: EventTeamModel['id'];
  subtype: BetSubtype.TeamPosition;
  directionIsTop: boolean;
  numberOfTeams: number;
};

type MainEventScoreBetDetails = {
  eventId: EventModel['id'];
  teamId: EventTeamModel['id'];
  subtype: BetSubtype.Score;
  directionIsOver: boolean;
  ouValue: number;
};

type BetDetails<T extends BetType = BetType> = T extends BetType.DuelWinner
  ? DuelWinnerBetDetails
  : T extends BetType.SpecialSpaceEvent
    ? SpecialSpaceEventBetDetails
    : T extends BetType.ChaosSpaceEvent
      ? ChaosSpaceEventBetDetails<BetSubtype>
      : T extends BetType.MainEvent
        ? MainEventBetDetails<BetSubtype>
        : Record<string, never>;
