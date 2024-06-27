import {
  PlayerWithUserAndRankInfo,
  PlayerWithUserInfo,
} from '../data-access/player.service';

export function addRankingInfoToPlayers(
  playersWithUserInfo: PlayerWithUserInfo[],
  filterOnlyEnabled = false,
): PlayerWithUserAndRankInfo[] {
  const players = filterOnlyEnabled
    ? playersWithUserInfo.filter((player) => player.enabled)
    : playersWithUserInfo;
  let currentRank = 1;
  let previousScore = players[0]?.score;

  return players.map((player, index) => {
    if (player.score !== previousScore) {
      currentRank = index + 1;
    }
    previousScore = player.score;
    return {
      enabled: player.enabled,
      user_id: player.user_id,
      player_id: player.player_id,
      display_name: player.display_name,
      score: player.score,
      avatar_url: player.avatar_url,
      rank: currentRank,
      rankEmoji:
        currentRank === 1
          ? '👑'
          : currentRank === players.length
            ? '💩'
            : undefined,
      can_edit_profile: player.can_edit_profile,
      can_place_bets: player.can_place_bets,
      squidward_mode: player.squidward_mode,
      can_toggle_squidward_mode: player.can_toggle_squidward_mode,
    };
  });
}
