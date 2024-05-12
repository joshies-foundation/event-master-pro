import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, switchMap } from 'rxjs';
import { Signal, TrackByFunction } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { showErrorMessage } from './message-helpers';
import { Database, Tables } from './schema';
import { RealtimeFilter, liveTable } from './supabase-live-table';
import { PlayerModel, TransactionModel } from './supabase-types';

export enum Table {
  User = 'user',
  UserNotificationsSubscription = 'user_notifications_subscription',
  GameState = 'game_state',
  GameboardSpace = 'gameboard_space',
  Session = 'session',
  Transaction = 'transaction',
  Player = 'player',
  PlayerRoundScore = 'player_round_score',
  Rules = 'rules',
}

export enum View {
  LifetimeUserStats = 'lifetime_user_stats',
}

export enum Function {
  CreateSession = 'create_session',
  EndRound = 'end_round',
  GetAllScoresFromSession = 'get_all_scores_from_session',
  GetPlayerRoundScoresFromSession = 'get_player_round_scores_from_session',
  OverridePoints = 'override_points',
  StartSessionEarly = 'start_session_early',
  LogRoundMoves = 'log_round_moves',
}

export enum StorageBucket {
  Avatars = 'avatars',
}

export enum SessionStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Finished = 'finished',
}

export enum GameboardSpaceEffect {
  GainPoints = 'gain_points',
  GainPointsOrDoActivity = 'gain_points_or_do_activity',
}

export type TTable = keyof Database['public']['Tables'];

function subscribeToLiveTable<Table extends TTable, Row extends Tables<Table>>(
  supabase: SupabaseClient<Database>,
  table: Table,
  callback: (rows: readonly Row[]) => void,
  filter?: RealtimeFilter<Database, Table>,
): () => Promise<'ok' | 'timed out' | 'error'> {
  const channel = liveTable(supabase, {
    table,
    filter,
    callback: (error, rows: readonly Row[]) => {
      if (error) {
        channel
          .unsubscribe()
          .then(() => subscribeToLiveTable(supabase, table, callback, filter));
        return;
      }
      callback(rows);
    },
  });

  return () => channel?.unsubscribe();
}

export function realtimeUpdatesFromTable<
  Table extends TTable,
  Row extends Tables<Table>,
>(
  supabase: SupabaseClient<Database>,
  table: Table,
  filter?: RealtimeFilter<Database, Table>,
): Observable<Row[]> {
  return new Observable((subscriber) =>
    subscribeToLiveTable(
      supabase,
      table,
      (rows) => subscriber.next(rows as Row[]),
      filter,
    ),
  );
}

export function realtimeUpdatesFromTableAsSignal<
  Table extends TTable,
  Row extends Tables<Table>,
>(
  supabase: SupabaseClient<Database>,
  table: Table,
  filter?:
    | Signal<RealtimeFilter<Database, Table> | undefined>
    | RealtimeFilter<Database, Table>,
): Signal<Row[]> {
  if (typeof filter === 'string' || filter === undefined) {
    return toSignal(realtimeUpdatesFromTable(supabase, table, filter), {
      initialValue: [],
    });
  }

  return toSignal(
    toObservable(filter).pipe(
      switchMap((filter) =>
        realtimeUpdatesFromTable<Table, Row>(supabase, table, filter),
      ),
    ),
    { initialValue: [] },
  );
}

export async function showMessageOnError<T>(
  promise: PromiseLike<T>,
  messageService: MessageService,
  message?: string,
): Promise<T> {
  const response = await promise;
  const error = (response as { error?: { message?: string } }).error;

  if (error) {
    showErrorMessage(
      message ?? error.message ?? 'Please try again later',
      messageService,
    );
  }

  return response;
}

interface RowWithId {
  id: number | string;
}

export const trackById: TrackByFunction<RowWithId> = (index, row: RowWithId) =>
  row.id;

export const trackByPlayerId: TrackByFunction<
  Pick<TransactionModel, 'player_id'>
> = (index, row) => row.player_id;

export const trackByUserId: TrackByFunction<Pick<PlayerModel, 'user_id'>> = (
  index,
  row,
) => row.user_id;
