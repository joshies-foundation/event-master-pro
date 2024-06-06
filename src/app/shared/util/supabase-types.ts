import { Database, Tables } from './schema';
import {
  Table,
  View,
  Function,
  GameboardSpaceEffect,
  SpaceEventStatus,
  DuelStatus,
} from './supabase-helpers';
import { PlayerWithUserAndRankInfo } from '../data-access/player.service';

type PublicSchema = Database[Extract<keyof Database, 'public'>];

// based on the Tables type generated by the Supabase CLI in ./schema
type FunctionReturnType<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Functions']
    | { schema: keyof Database },
  FunctionName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Functions']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Functions'][FunctionName] extends {
      Returns: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Functions']
    ? PublicSchema['Functions'][PublicTableNameOrOptions] extends {
        Returns: infer R;
      }
      ? R
      : never
    : never;

export type GainPointsSpaceEffectData = {
  pointsGained: number;
};

export type GainPointsOrDoActivitySpaceEffectData = {
  pointsGained: number;
  alternativeActivity: string;
};

export enum SpecialSpaceEventType {
  PlayerGainsPointsBasedOnGameScore = 'player_gains_points_based_on_game_score',
  EveryoneGainsPointsBasedOnRank = 'everyone_gains_points_based_on_rank',
}

export enum ChaosSpaceEventType {
  EveryoneGainsPointsBasedOnRank = 'everyone_gains_points_based_on_rank',
  EveryoneLosesPercentageOfTheirPoints = 'everyone_loses_percentage_of_their_points',
  EveryoneLosesPercentageOfTheirPointsBasedOnTaskFailure = 'everyone_loses_percentage_of_their_points_based_on_task_failure',
  PointSwap = 'point_swap',
}

export interface PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails {
  pointsLabelSingular: string;
  pointsLabelPlural: string;
  sessionPointsPerGamePoint: number;
}

export interface EveryoneGainsPointsBasedOnRankSpecialSpaceEventDetails {
  lastPlacePoints: number;
}

export interface EveryoneLosesAPercentageOfTheirPointsChaosSpaceDetails {
  percentageLoss: number;
}

export type SpecialSpaceEventDetails<T extends SpecialSpaceEventType> =
  T extends SpecialSpaceEventType.PlayerGainsPointsBasedOnGameScore
    ? PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails
    : T extends SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank
      ? EveryoneGainsPointsBasedOnRankSpecialSpaceEventDetails
      : // : T extends SpecialSpaceEventType.EveryoneLosesAPercentageOfTheirPoints
        //   ? EveryoneLosesAPercentageOfTheirPointsSpecialSpaceEffectData
        //   : T extends SpecialSpaceEventType.EveryoneLosesAPercentageOfTheirPointsBasedOnTaskFailure
        //     ? EveryoneLosesAPercentageOfTheirPointsBasedOnTaskFailureSpecialSpaceEffectData
        //     : T extends SpecialSpaceEventType.PointSwap
        //       ? Record<string, never>
        never;

export interface SpecialSpaceEventEffect<
  T extends SpecialSpaceEventType = SpecialSpaceEventType,
> {
  type: T;
  data: SpecialSpaceEventDetails<T>;
}

export interface SpecialSpaceEvent<
  T extends SpecialSpaceEventType = SpecialSpaceEventType,
> {
  name: string;
  effect: SpecialSpaceEventEffect<T>;
}

export interface SpecialSpaceEffectData {
  specialSpaceEventTemplateIds: SpecialSpaceEventTemplateModel['id'][];
}

export interface DuelSpaceEffectData {
  duelGames: string[];
}

export type GameboardSpaceEffectData<T extends GameboardSpaceEffect> =
  T extends GameboardSpaceEffect.GainPoints
    ? GainPointsSpaceEffectData
    : T extends GameboardSpaceEffect.GainPointsOrDoActivity
      ? GainPointsOrDoActivitySpaceEffectData
      : T extends GameboardSpaceEffect.Special
        ? SpecialSpaceEffectData
        : T extends GameboardSpaceEffect.Duel
          ? DuelSpaceEffectData
          : never;

export interface GameboardSpaceEffectWithData<
  T extends GameboardSpaceEffect = GameboardSpaceEffect,
> {
  effect: T;
  effect_data: GameboardSpaceEffectData<T>;
}

export type GameboardSpaceModel<
  T extends GameboardSpaceEffect = GameboardSpaceEffect,
> = Omit<Tables<Table.GameboardSpace>, 'effect' | 'effect_data'> &
  GameboardSpaceEffectWithData<T>;

export type OmitAutoGeneratedColumns<T extends object> = Omit<
  T,
  'id' | 'created_at' | 'updated_at'
>;

export type SpecialSpaceEventTemplateModel<
  T extends SpecialSpaceEventType = SpecialSpaceEventType,
> = Omit<Tables<Table.SpecialSpaceEventTemplate>, 'type' | 'details'> & {
  type: T;
  details: SpecialSpaceEventDetails<T>;
};

export type SpecialSpaceEventsForCurrentRoundModel = Omit<
  Tables<View.SpecialSpaceEventsForCurrentRound>,
  'status'
> & {
  status: SpaceEventStatus;
};

export type SpecialSpaceEventModel = Omit<
  Tables<Table.SpecialSpaceEvent>,
  'status'
> & {
  status: SpaceEventStatus;
};

export type DuelModel = Omit<Tables<Table.Duel>, 'status'> & {
  status: DuelStatus;
  challenger: PlayerWithUserAndRankInfo | undefined;
  opponent: PlayerWithUserAndRankInfo | undefined;
};

// tables
export type GameStateModel = Tables<Table.GameState>;
export type PlayerModel = Tables<Table.Player>;
export type PlayerRoundScoreModel = Tables<Table.PlayerRoundScore>;
export type RulesModel = Tables<Table.Rules>;
export type SessionModel = Tables<Table.Session>;
export type TransactionModel = Tables<Table.Transaction>;
export type UserModel = Tables<Table.User>;
export type UserNotificationsSubscriptionModel =
  Tables<Table.UserNotificationsSubscription>;
export type EventModel = Tables<Table.Event>;
export type EventFormatStandardScoringFormulaModel =
  Tables<Table.EventFormatStandardScoringFormula>;
export type EventParticipantModel = Tables<Table.EventParticipant>;
export type EventTeamModel = Tables<Table.EventTeam>;
export type EventTeamRoundScoreModel = Tables<Table.EventTeamRoundScore>;
export type BetModel = Tables<Table.Bet>;

// views
export type LifetimeUserStatsModel = Tables<View.LifetimeUserStats>;
export type MovesForCurrentRoundModel = Tables<View.MovesForCurrentRound>;

// functions
export type GetPlayerRoundScoreFunctionReturnType =
  FunctionReturnType<Function.GetPlayerRoundScoresFromSession>;
