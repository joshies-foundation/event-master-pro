import { PlayerModel } from '../../shared/util/supabase-types';
import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';

export interface PlayerWithScoreChanges extends PlayerWithUserAndRankInfo {
  scoreChange: number;
}

export function playersWithScoreChangesToPlayerScoreChanges(
  playersWithScoreChanges: PlayerWithScoreChanges[],
): Record<PlayerModel['id'], number> {
  return playersWithScoreChanges.reduce<Record<PlayerModel['id'], number>>(
    (prev, player) => ({
      ...prev,
      [player.player_id]: player.scoreChange,
    }),
    {},
  );
}
