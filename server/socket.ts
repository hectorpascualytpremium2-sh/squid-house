import { randomUUID } from 'node:crypto';

import type { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';

import type {
  ClientToServerEventPayloads,
  EvaluationCompletePayload,
  PhaseChangedPayload,
  ServerToClientEventPayloads,
} from '../shared/types/game.types.js';
import { GameState } from '../shared/types/game.types.js';

import type { GameEngine } from './gameEngine.js';

type ClientMessage = {
  [EventName in keyof ClientToServerEventPayloads]: {
    readonly event: EventName;
    readonly payload: ClientToServerEventPayloads[EventName];
  };
}[keyof ClientToServerEventPayloads];

type ServerMessage<EventName extends keyof ServerToClientEventPayloads> = {
  readonly event: EventName;
  readonly payload: ServerToClientEventPayloads[EventName];
};

interface SocketClient {
  readonly ws: WebSocket;
  readonly connectionId: string;
  playerId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseClientMessage(raw: unknown): ClientMessage | null {
  if (!isRecord(raw) || typeof raw.event !== 'string' || !isRecord(raw.payload)) {
    return null;
  }

  switch (raw.event) {
    case 'joinGame':
      return typeof raw.payload.playerName === 'string'
        ? { event: 'joinGame', payload: { playerName: raw.payload.playerName } }
        : null;
    case 'submitAnswer':
      return typeof raw.payload.questionId === 'string' &&
        typeof raw.payload.optionId === 'string'
        ? {
            event: 'submitAnswer',
            payload: {
              questionId: raw.payload.questionId,
              optionId: raw.payload.optionId,
            },
          }
        : null;
    case 'startGame':
      return { event: 'startGame', payload: {} };
    case 'nextQuestion':
      return { event: 'nextQuestion', payload: {} };
    default:
      return null;
  }
}

function sendEvent<EventName extends keyof ServerToClientEventPayloads>(
  ws: WebSocket,
  event: EventName,
  payload: ServerToClientEventPayloads[EventName],
): void {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }

  const message: ServerMessage<EventName> = { event, payload };
  ws.send(JSON.stringify(message));
}

export function attachSocketServer(httpServer: Server, engine: GameEngine): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer });
  const clients = new Set<SocketClient>();

  let previousPhase = engine.getSnapshot().phase;

  const broadcast = <EventName extends keyof ServerToClientEventPayloads>(
    event: EventName,
    payload: ServerToClientEventPayloads[EventName],
  ): void => {
    for (const client of clients) {
      sendEvent(client.ws, event, payload);
    }
  };

  engine.onMutation((snapshot) => {
    broadcast('snapshot', snapshot);

    if (snapshot.phase !== previousPhase) {
      const phaseChanged: PhaseChangedPayload = {
        phase: snapshot.phase,
        snapshot,
      };
      broadcast('phaseChanged', phaseChanged);

      if (snapshot.phase === GameState.QUESTION_ACTIVE && snapshot.currentQuestion) {
        broadcast('questionStarted', snapshot.currentQuestion);
      }

      if (snapshot.phase === GameState.LEADERBOARD && snapshot.currentQuestion) {
        const evaluationComplete: EvaluationCompletePayload = {
          questionId: snapshot.currentQuestion.id,
          correctOptionId: snapshot.currentQuestion.correctOptionId,
          snapshot,
        };
        broadcast('evaluationComplete', evaluationComplete);
      }

      previousPhase = snapshot.phase;
    }
  });

  wss.on('connection', (ws) => {
    const client: SocketClient = {
      ws,
      connectionId: randomUUID(),
      playerId: null,
    };

    clients.add(client);
    sendEvent(ws, 'snapshot', engine.getSnapshot());

    ws.on('message', (data) => {
      let parsed: unknown;

      try {
        parsed = JSON.parse(String(data));
      } catch {
        return;
      }

      const message = parseClientMessage(parsed);
      if (!message) {
        return;
      }

      switch (message.event) {
        case 'joinGame': {
          const player = engine.joinGame(client.connectionId, message.payload);
          client.playerId = player.id;
          sendEvent(ws, 'playerUpdated', player);
          break;
        }
        case 'submitAnswer':
          if (client.playerId) {
            engine.submitAnswer(client.playerId, message.payload);
          }
          break;
        case 'startGame':
          engine.startGame();
          break;
        case 'nextQuestion':
          engine.nextQuestion();
          break;
      }
    });

    ws.on('close', () => {
      if (client.playerId) {
        engine.setPlayerConnected(client.playerId, false);
      }
      clients.delete(client);
    });
  });

  return wss;
}
