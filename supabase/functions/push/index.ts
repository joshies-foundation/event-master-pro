import { Hono } from 'hono';
import { HTTPException } from 'hono/dist/types/http-exception';
import { StatusCode } from 'hono/dist/types/utils/http-status';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getPlayerDisplayName,
  sendPushNotificationToPlayers,
  sendPushNotificationToUsers,
} from '../_shared/push-notification-helpers.ts';

const edgeFunctionName = 'push';
const app = new Hono().basePath(`/${edgeFunctionName}`);

// return CORS headers for OPTIONS requests - needed when invoking function from a browser.
app.options('*', (c) => c.body(null, 204, corsHeaders));

interface BetWebhookPayload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: BetModel;
  schema: 'public';
  old_record: null | BetModel;
}

// abbreviated copies of bet data-types for use in this Edge Function
enum BetStatus {
  CanceledByGm = 'canceled_by_gm',
  Rejected = 'rejected',
  Active = 'active',
  RequesterWon = 'requester_won',
  OpponentWon = 'opponent_won',
  Push = 'push',
}
interface BetModel {
  requester_player_id: number;
  opponent_player_id: number;
  requester_wager: number;
  opponent_wager: number;
  description: string;
  status: string;
}

// bet insert/update webhook
app.post('/', async (c) => {
  // extract request payload
  const payload = (await c.req.json()) as BetWebhookPayload;
  console.log('Received Bet webhook payload:', payload);
  const { type, record: bet, old_record: oldBet } = payload;

  const requester = await getPlayerDisplayName(bet.requester_player_id);
  const opponent = await getPlayerDisplayName(bet.opponent_player_id);

  // send notification to opponent on bet creation
  if (type === 'INSERT') {
    const betHasEvenOdds = bet.requester_wager === bet.opponent_wager;

    await sendPushNotificationToPlayers(
      [bet.opponent_player_id],
      '👀 Bet Request',
      betHasEvenOdds
        ? `${requester} bets you ${bet.requester_wager} ${bet.requester_wager === 1 ? 'point' : 'points'} that ${bet.description}`
        : `${requester} bets you ${bet.description}. ${requester} wagers ${bet.requester_wager} ${bet.requester_wager === 1 ? 'point' : 'points'}, you wager ${bet.opponent_wager} ${bet.opponent_wager === 1 ? 'point' : 'points'}.`,
      '/betting',
    );

    return c.body(null, 201, corsHeaders);
  }

  const betStatusChanged = oldBet?.status !== bet.status;

  // only continue if the bet status changed
  if (!betStatusChanged) return;

  // send notifications based on new bet status
  switch (bet.status) {
    case BetStatus.CanceledByGm:
      await Promise.all([
        sendPushNotificationToPlayers(
          [bet.requester_player_id],
          '😵 Bet Canceled',
          `The GM canceled your bet against ${opponent}`,
          '/betting',
        ),
        sendPushNotificationToPlayers(
          [bet.opponent_player_id],
          '😵 Bet Canceled',
          `The GM canceled your bet against ${requester}`,
          '/betting',
        ),
      ]);
      break;

    case BetStatus.Rejected:
      await sendPushNotificationToPlayers(
        [bet.requester_player_id],
        '😔 Bet Rejected',
        `${opponent} rejected your bet`,
        '/betting',
      );
      break;

    case BetStatus.Active:
      await sendPushNotificationToPlayers(
        [bet.requester_player_id],
        '😎 Bet Accepted',
        `${opponent} accepted your bet. It's on!`,
        '/betting',
      );
      break;

    case BetStatus.RequesterWon:
      await Promise.all([
        sendPushNotificationToPlayers(
          [bet.requester_player_id],
          '✅🥳 Bet Won!',
          `You won ${bet.opponent_wager} ${bet.opponent_wager === 1 ? 'point' : 'points'} from your bet against ${opponent}!`,
          '/betting/resolved-bets',
        ),
        sendPushNotificationToPlayers(
          [bet.opponent_player_id],
          '❌🥲 Bet Lost',
          `You lost ${bet.opponent_wager} ${bet.opponent_wager === 1 ? 'point' : 'points'} from your bet against ${requester}`,
          '/betting/resolved-bets',
        ),
      ]);
      break;

    case BetStatus.OpponentWon:
      await Promise.all([
        sendPushNotificationToPlayers(
          [bet.opponent_player_id],
          '✅🥳 Bet Won!',
          `You won ${bet.requester_wager} ${bet.requester_wager === 1 ? 'point' : 'points'} from your bet against ${requester}!`,
          '/betting/resolved-bets',
        ),
        sendPushNotificationToPlayers(
          [bet.requester_player_id],
          '❌🥲 Bet Lost',
          `You lost ${bet.requester_wager} ${bet.requester_wager === 1 ? 'point' : 'points'} in your bet against ${opponent}`,
          '/betting/resolved-bets',
        ),
      ]);
      break;

    case BetStatus.Push:
      await Promise.all([
        sendPushNotificationToPlayers(
          [bet.requester_player_id],
          '😟 Push',
          `Your bet against ${opponent} was a push`,
          '/betting/resolved-bets',
        ),
        sendPushNotificationToPlayers(
          [bet.opponent_player_id],
          '😟 Push',
          `Your bet against ${requester} was a push`,
          '/betting/resolved-bets',
        ),
      ]);
      break;
  }

  return c.body(null, 201, corsHeaders);
});

interface GmMessagePayload {
  recipientUserIds: string[];
  title: string;
  body: string;
  openUrl?: string;
}

app.post('/gm-message', async (c) => {
  // extract request payload
  const payload = (await c.req.json()) as GmMessagePayload;
  console.log('Received GM Message payload:', payload);
  const { recipientUserIds, title, body, openUrl } = payload;

  // send notifications
  await sendPushNotificationToUsers(recipientUserIds, title, body, openUrl);

  return c.body(null, 201, corsHeaders);
});

// handle errors
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errorResponse = err.getResponse();
    return c.body(
      errorResponse.body,
      errorResponse.status as StatusCode,
      corsHeaders,
    );
  }

  return c.body(err.message, 500, corsHeaders);
});

Deno.serve(app.fetch);
