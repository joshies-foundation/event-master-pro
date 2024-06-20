import { BetModel, PlayerModel } from './supabase-types';
import { BetStatus } from './supabase-helpers';

// function playerWonBet(bet: BetModel, playerId: PlayerModel['id']): boolean {
//   const playerIsRequester = playerId === bet.requester_player_id;
//   const playerIsOpponent = playerId === bet.opponent_player_id;
//
//   const playerWonAsRequester =
//     bet.status === BetStatus.RequesterWon && playerIsRequester;
//   const playerWonAsOpponent =
//     bet.status === BetStatus.OpponentWon && playerIsOpponent;
//
//   return playerWonAsRequester || playerWonAsOpponent;
// }

export function betIsResolved(betStatus: BetStatus): boolean {
  return [
    BetStatus.Push,
    BetStatus.RequesterWon,
    BetStatus.OpponentWon,
  ].includes(betStatus);
}

export function betGainOrLossAmount(
  bet: BetModel,
  playerId: PlayerModel['id'],
): number {
  if (![BetStatus.RequesterWon, BetStatus.OpponentWon].includes(bet.status))
    return 0;

  const playerIsRequester = playerId === bet.requester_player_id;
  const playerIsOpponent = playerId === bet.opponent_player_id;

  const playerWonAsRequester =
    bet.status === BetStatus.RequesterWon && playerIsRequester;
  const playerWonAsOpponent =
    bet.status === BetStatus.OpponentWon && playerIsOpponent;
  const playerLostAsRequester =
    bet.status === BetStatus.OpponentWon && playerIsRequester;
  const playerLostAsOpponent =
    bet.status === BetStatus.RequesterWon && playerIsOpponent;

  if (playerWonAsRequester) return bet.opponent_wager;
  if (playerWonAsOpponent) return bet.requester_wager;
  if (playerLostAsRequester) return -bet.requester_wager;
  if (playerLostAsOpponent) return -bet.opponent_wager;

  return 0;
}

export function getUserBetData(
  bet: BetModel,
  userPlayerId: PlayerModel['id'],
): {
  userIsRequester: boolean;
  userWager: number;
  userOpponentName: string | undefined;
  pointWord: string;
  thoseWord: string;
  requesterDoesWords: string;
  opponentDoesWords: string;
  requesterTheirWord: string;
  opponentTheirWord: string;
} {
  const userIsRequester = bet.requester_player_id === userPlayerId;

  const userWager = userIsRequester ? bet.requester_wager : bet.opponent_wager;

  const userOpponentName = userIsRequester
    ? bet.opponent?.display_name
    : bet.requester?.display_name;

  const pointWord = userWager === 1 ? 'point' : 'points';

  const thoseWord = userWager === 1 ? 'That' : 'Those';

  const requesterDoesWords = userIsRequester
    ? 'you do'
    : `${bet.requester?.display_name} does`;

  const opponentDoesWords = userIsRequester
    ? `${bet.opponent?.display_name} does`
    : 'you do';

  const requesterTheirWord = userIsRequester ? 'your' : 'their';

  const opponentTheirWord = userIsRequester ? 'their' : 'your';

  return {
    userIsRequester,
    userWager,
    userOpponentName,
    pointWord,
    thoseWord,
    requesterDoesWords,
    opponentDoesWords,
    requesterTheirWord,
    opponentTheirWord,
  };
}
