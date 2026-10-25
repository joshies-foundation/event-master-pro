import {
  PlayerWithUserAndRankInfo,
  PlayerWithUserInfo,
} from '../data-access/player.service';
import { compareIds, compareNames } from './sort-helpers';

export function comparePlayersByRank(
  a: PlayerWithUserInfo,
  b: PlayerWithUserInfo,
): number {
  return (
    b.score - a.score ||
    compareNames(a.display_name, b.display_name) ||
    compareIds(a.user_id, b.user_id)
  );
}

export function addRankingInfoToPlayers(
  playersWithUserInfo: PlayerWithUserInfo[],
  filterOnlyEnabled = false,
): PlayerWithUserAndRankInfo[] {
  const players = filterOnlyEnabled
    ? playersWithUserInfo.filter((player) => player.enabled)
    : playersWithUserInfo;
  const ranks: number[] = [];
  players.forEach((player, index) => {
    ranks.push(
      index > 0 && player.score === players[index - 1].score
        ? ranks[index - 1]
        : index + 1,
    );
  });
  const lastRank = ranks.at(-1);

  return players.map((player, index) => {
    const rank = ranks[index];
    return {
      enabled: player.enabled,
      user_id: player.user_id,
      player_id: player.player_id,
      display_name: player.display_name,
      real_name: player.real_name,
      score: player.score,
      prize_tokens: player.prize_tokens,
      avatar_url: player.avatar_url,
      rank,
      rankEmoji: rank === 1 ? '👑' : rank === lastRank ? '💩' : undefined,
      can_edit_profile: player.can_edit_profile,
      can_place_bets: player.can_place_bets,
      squidward_mode: player.squidward_mode,
      can_toggle_squidward_mode: player.can_toggle_squidward_mode,
    };
  });
}
