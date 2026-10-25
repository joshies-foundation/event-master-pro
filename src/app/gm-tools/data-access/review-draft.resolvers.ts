import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { firstValueFrom, from, Observable } from 'rxjs';
import { EventService } from '../../shared/data-access/event.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { defined } from '../../shared/util/rxjs-helpers';
import {
  RoundPhase,
  showMessageOnError,
} from '../../shared/util/supabase-helpers';
import { GameboardSpaceEntryFormModel } from '../feature/gameboard-space-entry-page.component';
import {
  completeRoundDraft,
  DraftRound,
  RoundDraft,
  RoundDraftKey,
} from './round-draft';

type GameboardMove = GameboardSpaceEntryFormModel[string];

interface Review<Entry> {
  phase: RoundPhase;
  draftKey: RoundDraftKey;
  entryPage: string;
  isEntry: (value: unknown) => value is Entry;
  requiredIds: (round: DraftRound) => Promise<string[]>;
}

function resolveReviewDraft<Entry>(
  review: Review<Entry>,
): Observable<RoundDraft<Entry> | RedirectCommand> {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const gameStateService = inject(GameStateService);

  return from(
    (async () => {
      const { data: gameState, error } = await showMessageOnError(
        gameStateService.fetchGameState(),
        messageService,
        'Could not load the current round. Check your connection and try again.',
      );
      if (error) return undefined;
      if (gameState.round_phase !== review.phase) {
        return new RedirectCommand(router.parseUrl('/gm-tools'));
      }
      const round: DraftRound = {
        sessionId: gameState.session_id,
        roundNumber: gameState.round_number,
      };
      const draft = completeRoundDraft(
        review.draftKey,
        round,
        await review.requiredIds(round),
        review.isEntry,
      );
      return draft ?? new RedirectCommand(router.parseUrl(review.entryPage));
    })(),
  ).pipe(defined());
}

function isGameboardMove(value: unknown): value is GameboardMove {
  const move = value as Partial<GameboardMove> | undefined;
  return (
    typeof move?.distanceTraveled === 'number' &&
    typeof move.gameboardSpaceId === 'number'
  );
}

export const gameboardMovesDraftResolver: ResolveFn<
  RoundDraft<GameboardMove>
> = () => {
  const players$ = inject(PlayerService).players$;
  return resolveReviewDraft({
    phase: RoundPhase.GameboardMoves,
    draftKey: RoundDraftKey.GameboardMoves,
    entryPage: '/gm-tools/space-entry',
    isEntry: isGameboardMove,
    requiredIds: async () =>
      (await firstValueFrom(players$)).map((player) =>
        String(player.player_id),
      ),
  });
};

export const eventResultsDraftResolver: ResolveFn<RoundDraft<number>> = () => {
  const eventService = inject(EventService);
  return resolveReviewDraft({
    phase: RoundPhase.Event,
    draftKey: RoundDraftKey.EventResults,
    entryPage: '/gm-tools/end-round',
    isEntry: (value): value is number => typeof value === 'number',
    requiredIds: async ({ roundNumber }) => {
      const [events, eventTeams] = await Promise.all([
        firstValueFrom(eventService.events$),
        firstValueFrom(eventService.eventTeams$),
      ]);
      const event = events.find((event) => event.round_number === roundNumber);
      return (eventTeams ?? [])
        .filter((eventTeam) => eventTeam.event_id === event?.id)
        .map((eventTeam) => String(eventTeam.id));
    },
  });
};
