import { inject, Injectable, Signal } from '@angular/core';
import {
  GameboardSpaceModel,
  OmitAutoGeneratedColumns,
  SpecialSpaceEventModel,
  SpecialSpaceEventsForCurrentRoundModel,
  SpecialSpaceEventTemplateModel,
  SpecialSpaceEventType,
  UserModel,
} from '../util/supabase-types';
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import {
  Function,
  GameboardSpaceEffect,
  realtimeUpdatesFromTable,
  SpaceEventStatus,
  Table,
  View,
} from '../util/supabase-helpers';
import { GameboardSpaceEntryFormModel } from '../../gm-tools/feature/gameboard-space-entry-page.component';
import { Database, Json } from '../util/schema';
import {
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { whenNotNull } from '../util/rxjs-helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameStateService } from './game-state.service';
import { PlayerService } from './player.service';

export type SpecialSpaceEventWithPlayerAndTemplateData =
  SpecialSpaceEventModel & {
    avatar_url: UserModel['avatar_url'] | null;
    display_name: UserModel['display_name'] | null;
    template: SpecialSpaceEventTemplateModel | null;
  };

@Injectable({
  providedIn: 'root',
})
export class GameboardService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);

  readonly gameboardSpaces$: Observable<GameboardSpaceModel[] | null> =
    this.gameStateService.sessionId$.pipe(
      whenNotNull((activeSessionId) =>
        (
          realtimeUpdatesFromTable(
            this.supabase,
            Table.GameboardSpace,
            `session_id=eq.${activeSessionId}`,
          ) as Observable<GameboardSpaceModel[]>
        ).pipe(map((spaces) => spaces.sort((a, b) => a.id - b.id))),
      ),
      shareReplay(1),
    );

  readonly specialSpaceEventTemplates$: Observable<
    SpecialSpaceEventTemplateModel[] | null
  > = this.gameStateService.sessionId$.pipe(
    whenNotNull(
      (activeSessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.SpecialSpaceEventTemplate,
          `session_id=eq.${activeSessionId}`,
        ) as unknown as Observable<SpecialSpaceEventTemplateModel[]>,
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly gameboardSpaces: Signal<GameboardSpaceModel[] | null | undefined> =
    toSignal(this.gameboardSpaces$);

  readonly specialSpaceEvents$: Observable<
    SpecialSpaceEventWithPlayerAndTemplateData[]
  > = this.gameStateService.sessionId$.pipe(
    switchMap(
      (sessionId) =>
        realtimeUpdatesFromTable(
          this.supabase,
          Table.SpecialSpaceEvent,
          `session_id=eq.${sessionId}`,
        ) as Observable<SpecialSpaceEventModel[]>,
    ),
    switchMap((specialSpaceEvents) => {
      if (!specialSpaceEvents?.length) return of([]);

      return combineLatest({
        players: this.playerService.players$,
        specialSpaceEventTemplates: this.specialSpaceEventTemplates$,
      }).pipe(
        map(({ players, specialSpaceEventTemplates }) =>
          specialSpaceEvents
            .sort((a, b) => a.id - b.id)
            .map((specialSpaceEvent) => {
              const player = players?.find(
                (p) => p.player_id === specialSpaceEvent.player_id,
              );

              const specialSpaceEventTemplate =
                specialSpaceEventTemplates?.find(
                  (template) => template.id === specialSpaceEvent.template_id,
                );

              return {
                ...specialSpaceEvent,
                avatar_url: player?.avatar_url ?? null,
                display_name: player?.display_name ?? null,
                template: specialSpaceEventTemplate ?? null,
              };
            }),
        ),
      );
    }),
    shareReplay(1),
  );

  readonly specialSpaceEventsForThisTurn$: Observable<
    SpecialSpaceEventWithPlayerAndTemplateData[] | null
  > = this.gameStateService.roundNumber$.pipe(
    switchMap((roundNumber) =>
      this.specialSpaceEvents$.pipe(
        map(
          (events) =>
            events?.filter((event) => event.round_number === roundNumber) ??
            null,
        ),
      ),
    ),
    shareReplay(1),
  );

  readonly allSpecialSpaceEventsForThisTurnAreResolved$: Observable<boolean> =
    this.specialSpaceEventsForThisTurn$.pipe(
      map((events) =>
        !events?.length // return true if there are no special space events
          ? true
          : events.every((event) =>
              [SpaceEventStatus.Finished, SpaceEventStatus.Canceled].includes(
                event.status,
              ),
            ),
      ),
      shareReplay(1),
    );

  readonly nonCanceledSpecialSpaceEventsForThisTurn$: Observable<
    SpecialSpaceEventWithPlayerAndTemplateData[] | null
  > = this.specialSpaceEventsForThisTurn$.pipe(
    map(
      (specialSpaceEvents) =>
        specialSpaceEvents?.filter(
          (event) => event.status !== SpaceEventStatus.Canceled,
        ) ?? null,
    ),
    shareReplay(1),
  );

  async createNewGameboardSpaceType<T extends GameboardSpaceEffect>(
    gameboardSpace: OmitAutoGeneratedColumns<GameboardSpaceModel<T>>,
  ): Promise<PostgrestSingleResponse<null>> {
    return (
      this.supabase
        .from(Table.GameboardSpace)
        // @ts-expect-error: for whatever reason, this doesn't accept the effect_data type as JSON
        .insert([gameboardSpace])
    );
  }

  async updateGameboardSpaceType<T extends GameboardSpaceEffect>(
    gameboardSpaceId: number,
    partialGameboardSpace: Partial<
      OmitAutoGeneratedColumns<GameboardSpaceModel<T>>
    >,
  ): Promise<PostgrestSingleResponse<null>> {
    return (
      this.supabase
        .from(Table.GameboardSpace)
        // @ts-expect-error: for whatever reason, this doesn't accept the effect_data type as JSON
        .update(partialGameboardSpace)
        .eq('id', gameboardSpaceId)
    );
  }

  async deleteGameboardSpaceType(
    gameboardSpaceId: number,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.GameboardSpace)
      .delete()
      .eq('id', gameboardSpaceId);
  }

  async createNewSpecialSpaceEventTemplate<T extends SpecialSpaceEventType>(
    eventTemplate: OmitAutoGeneratedColumns<SpecialSpaceEventTemplateModel<T>>,
  ): Promise<PostgrestSingleResponse<null>> {
    return (
      this.supabase
        .from(Table.SpecialSpaceEventTemplate)
        // @ts-expect-error: for whatever reason, this doesn't accept the effect_data type as JSON
        .insert([eventTemplate])
    );
  }

  async updateSpecialSpaceEventTemplate<T extends SpecialSpaceEventType>(
    gameboardSpaceId: number,
    partialSpecialSpaceEventTemplate: Partial<
      OmitAutoGeneratedColumns<SpecialSpaceEventTemplateModel<T>>
    >,
  ): Promise<PostgrestSingleResponse<null>> {
    return (
      this.supabase
        .from(Table.SpecialSpaceEventTemplate)
        // @ts-expect-error: for whatever reason, this doesn't accept the effect_data type as JSON
        .update(partialSpecialSpaceEventTemplate)
        .eq('id', gameboardSpaceId)
    );
  }

  async deleteSpecialSpaceEventTemplate(
    specialSpaceEventTemplateId: number,
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.SpecialSpaceEventTemplate)
      .delete()
      .eq('id', specialSpaceEventTemplateId);
  }

  async logRoundMoves(
    roundNumber: number,
    playerSpaceChanges: GameboardSpaceEntryFormModel,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.LogRoundMoves, {
      roundnumber: roundNumber,
      playermoves: playerSpaceChanges as unknown as Json,
    });
  }

  async getSpecialSpaceEventsForCurrentRound(): Promise<
    PostgrestResponse<SpecialSpaceEventsForCurrentRoundModel>
  > {
    return this.supabase.from(View.SpecialSpaceEventsForCurrentRound).select();
  }

  async selectSpecialSpaceEventTemplate(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    specialSpaceEventTemplateId: SpecialSpaceEventTemplateModel['id'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.SpecialSpaceEvent)
      .update({
        template_id: specialSpaceEventTemplateId,
        status: SpaceEventStatus.WaitingToBegin,
      })
      .eq('id', specialSpaceEventId);
  }

  async startSpecialSpaceEvent(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.SpecialSpaceEvent)
      .update({
        status: SpaceEventStatus.InProgress,
      })
      .eq('id', specialSpaceEventId);
  }

  async cancelSpecialSpaceEvent(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
  ): Promise<PostgrestSingleResponse<null>> {
    return this.supabase
      .from(Table.SpecialSpaceEvent)
      .update({
        status: SpaceEventStatus.Canceled,
      })
      .eq('id', specialSpaceEventId);
  }

  async submitSpecialSpaceEventScore(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    score: number,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.SubmitSpecialSpaceEventScore, {
      special_space_event_id: specialSpaceEventId,
      score,
    });
  }

  async submitGainPointsBasedOnRank(
    specialSpaceEventId: SpecialSpaceEventModel['id'],
    specialSpaceEventTemplateId: SpecialSpaceEventTemplateModel['id'],
    playerScoreChanges: Record<string, number>,
  ): Promise<PostgrestSingleResponse<undefined>> {
    return this.supabase.rpc(Function.SubmitGainPointsBasedOnRank, {
      special_space_event_id: specialSpaceEventId,
      special_space_event_template_id: specialSpaceEventTemplateId,
      player_score_changes: playerScoreChanges,
    });
  }
}
