import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { GameStateModel, SessionModel } from '../../shared/util/supabase-types';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../../shared/data-access/session.service';
import { PostgrestResponse } from '@supabase/supabase-js';

export interface EditGameStateResolverData {
  gameState: GameStateModel;
  allSessionsResponse: PostgrestResponse<SessionModel>;
}

export const editGameStateResolver: ResolveFn<
  EditGameStateResolverData
> = async () => {
  const [gameState, allSessionsResponse] = await Promise.all([
    firstValueFrom(inject(GameStateService).gameState$),
    inject(SessionService).getAllSessions(),
  ]);

  return { gameState, allSessionsResponse };
};
