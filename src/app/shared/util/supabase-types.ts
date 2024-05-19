import { Database, Enums, Tables } from './schema';
import {
  Table,
  View,
  Function,
  GameboardSpaceEffect,
} from './supabase-helpers';

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
  EveryoneLosesAPercentageOfTheirPoints = 'everyone_gains_a_percentage_of_their_points',
  EveryoneLosesAPercentageOfTheirPointsBasedOnTaskFailure = 'everyone_loses_a_percentage_of_their_points_based_on_task_failure',
  PointSwap = 'point_swap',
}

export type PlayerGainsPointsBasedOnGameScoreSpecialSpaceEffectData = {
  pointsLabelSingular: string;
  pointsLabelPlural: string;
  sessionPointsPerGamePoint: number;
};

export type EveryoneGainsPointsBasedOnRankSpecialSpaceEffectData = {
  pointsForRank: number[];
};

export type EveryoneLosesAPercentageOfTheirPointsSpecialSpaceEffectData = {
  percentageLoss: number;
};

export type EveryoneLosesAPercentageOfTheirPointsBasedOnTaskFailureSpecialSpaceEffectData =
  EveryoneLosesAPercentageOfTheirPointsSpecialSpaceEffectData;

export type SpecialSpaceEventEffectData<T extends SpecialSpaceEventType> =
  T extends SpecialSpaceEventType.PlayerGainsPointsBasedOnGameScore
    ? PlayerGainsPointsBasedOnGameScoreSpecialSpaceEffectData
    : T extends SpecialSpaceEventType.EveryoneGainsPointsBasedOnRank
      ? EveryoneGainsPointsBasedOnRankSpecialSpaceEffectData
      : T extends SpecialSpaceEventType.EveryoneLosesAPercentageOfTheirPoints
        ? EveryoneLosesAPercentageOfTheirPointsSpecialSpaceEffectData
        : T extends SpecialSpaceEventType.EveryoneLosesAPercentageOfTheirPointsBasedOnTaskFailure
          ? EveryoneLosesAPercentageOfTheirPointsBasedOnTaskFailureSpecialSpaceEffectData
          : T extends SpecialSpaceEventType.PointSwap
            ? Record<string, never>
            : never;

export interface SpecialSpaceEventEffect<
  T extends SpecialSpaceEventType = SpecialSpaceEventType,
> {
  type: T;
  data: SpecialSpaceEventEffectData<T>;
}

export interface SpecialSpaceEvent<
  T extends SpecialSpaceEventType = SpecialSpaceEventType,
> {
  name: string;
  effect: SpecialSpaceEventEffect<T>;
}

export interface SpecialSpaceEffectData {
  specialEvents: SpecialSpaceEvent[];
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

// views
export type LifetimeUserStatsModel = Tables<View.LifetimeUserStats>;
export type MovesForCurrentRoundModel = Tables<View.MovesForCurrentRound>;

// enums
export type SessionStatusType = Enums<'session_status'>;
export type GameboardSpaceEffectType = Enums<'gameboard_space_effect'>;
// export type EventFormat = Enums<'event_format'>;

// functions
export type GetPlayerRoundScoreFunctionReturnType =
  FunctionReturnType<Function.GetPlayerRoundScoresFromSession>;
