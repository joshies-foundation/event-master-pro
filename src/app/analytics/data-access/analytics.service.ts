import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { PostgrestResponse, SupabaseClient } from '@supabase/supabase-js';
import { Function, Table, View } from '../../shared/util/supabase-helpers';
import { SessionService } from '../../shared/data-access/session.service';
import { distinctUntilIdChanged } from '../../shared/util/rxjs-helpers';
import { PlayerWithUserInfo } from '../../shared/data-access/player.service';
import { Database } from '../../shared/util/schema';
import { LifetimeUserStatsModel } from '../../shared/util/supabase-types';

export interface IdAndName {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly sessionService = inject(SessionService);

  getAllPreviousSessions(): Observable<IdAndName[]> {
    return this.sessionService.session$.pipe(
      distinctUntilIdChanged(),
      switchMap((session) => {
        if (session === null) {
          return of([]);
        }

        return from(
          this.supabase
            .from(Table.Session)
            .select('id, name')
            .filter('id', 'neq', session.id)
            .order('id', { ascending: false }),
        ).pipe(map((response) => (response.data ? response.data : [])));
      }),
    );
  }

  getAllScoresFromSession(sessionId: number): Observable<PlayerWithUserInfo[]> {
    return from(
      this.supabase.rpc(Function.GetAllScoresFromSession, {
        sessionid: sessionId,
      }),
    ).pipe(
      map(
        (response) =>
          (response.data
            ? response.data
            : []) as unknown as PlayerWithUserInfo[],
      ),
    );
  }

  getLifetimeUserStats(): Observable<
    PostgrestResponse<LifetimeUserStatsModel>
  > {
    return from(this.supabase.from(View.LifetimeUserStats).select('*'));
  }
}
