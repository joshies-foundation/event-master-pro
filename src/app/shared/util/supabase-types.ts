import { Tables } from './schema';
import { Table, View } from './supabase-helpers';

export type GameStateModel = Tables<Table.GameState>;
export type PlayerModel = Tables<Table.Player>;
export type RulesModel = Tables<Table.Rules>;
export type SessionModel = Tables<Table.Session>;
export type UserModel = Tables<Table.User>;
export type UserNotificationsSubscriptionModel =
  Tables<Table.UserNotificationsSubscription>;
export type LifetimeUserStatsModel = Tables<View.LifetimeUserStats>;
