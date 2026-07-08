import type {
  ClientToServerEventPayloads,
  ServerToClientEventPayloads,
} from '../../shared/types/game.types';

export type WsConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed';

/** Server event that pushes the authoritative game state (`snapshot`). */
export const GAME_STATE_UPDATE_EVENT = 'snapshot' as const satisfies keyof ServerToClientEventPayloads;

type ServerMessage = {
  [EventName in keyof ServerToClientEventPayloads]: {
    readonly event: EventName;
    readonly payload: ServerToClientEventPayloads[EventName];
  };
}[keyof ServerToClientEventPayloads];

type ClientMessage = {
  [EventName in keyof ClientToServerEventPayloads]: {
    readonly event: EventName;
    readonly payload: ClientToServerEventPayloads[EventName];
  };
}[keyof ClientToServerEventPayloads];

type ServerEventHandler<EventName extends keyof ServerToClientEventPayloads> = (
  payload: ServerToClientEventPayloads[EventName],
) => void;

type StatusHandler = (status: WsConnectionStatus) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseServerMessage(raw: unknown): ServerMessage | null {
  if (!isRecord(raw) || typeof raw.event !== 'string') {
    return null;
  }

  if (!('payload' in raw)) {
    return null;
  }

  switch (raw.event) {
    case GAME_STATE_UPDATE_EVENT:
      return isRecord(raw.payload)
        ? {
            event: GAME_STATE_UPDATE_EVENT,
            payload: raw.payload as unknown as ServerToClientEventPayloads['snapshot'],
          }
        : null;
    case 'playerUpdated':
      return isRecord(raw.payload)
        ? {
            event: 'playerUpdated',
            payload: raw.payload as unknown as ServerToClientEventPayloads['playerUpdated'],
          }
        : null;
    case 'phaseChanged':
      return isRecord(raw.payload)
        ? {
            event: 'phaseChanged',
            payload: raw.payload as unknown as ServerToClientEventPayloads['phaseChanged'],
          }
        : null;
    case 'questionStarted':
      return isRecord(raw.payload)
        ? {
            event: 'questionStarted',
            payload: raw.payload as unknown as ServerToClientEventPayloads['questionStarted'],
          }
        : null;
    case 'evaluationComplete':
      return isRecord(raw.payload)
        ? {
            event: 'evaluationComplete',
            payload: raw.payload as unknown as ServerToClientEventPayloads['evaluationComplete'],
          }
        : null;
    default:
      return null;
  }
}

export interface WsClient {
  connect(url: string): void;
  disconnect(): void;
  send<EventName extends keyof ClientToServerEventPayloads>(
    event: EventName,
    payload: ClientToServerEventPayloads[EventName],
  ): void;
  on<EventName extends keyof ServerToClientEventPayloads>(
    event: EventName,
    handler: ServerEventHandler<EventName>,
  ): () => void;
  onStatusChange(handler: StatusHandler): () => void;
  getStatus(): WsConnectionStatus;
}

export function createWsClient(): WsClient {
  let socket: WebSocket | null = null;
  let status: WsConnectionStatus = 'idle';
  let connectUrl: string | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let shouldReconnect = false;

  const eventHandlers = new Map<
    keyof ServerToClientEventPayloads,
    Set<(payload: ServerToClientEventPayloads[keyof ServerToClientEventPayloads]) => void>
  >();
  const statusHandlers = new Set<StatusHandler>();

  const setStatus = (nextStatus: WsConnectionStatus): void => {
    if (status === nextStatus) {
      return;
    }

    status = nextStatus;
    for (const handler of statusHandlers) {
      handler(nextStatus);
    }
  };

  const emitEvent = <EventName extends keyof ServerToClientEventPayloads>(
    event: EventName,
    payload: ServerToClientEventPayloads[EventName],
  ): void => {
    const handlers = eventHandlers.get(event);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(payload);
    }
  };

  const bindSocket = (ws: WebSocket): void => {
    ws.addEventListener('open', () => {
      setStatus('open');
    });

    ws.addEventListener('message', (messageEvent) => {
      let parsed: unknown;

      try {
        parsed = JSON.parse(String(messageEvent.data));
      } catch {
        return;
      }

      const message = parseServerMessage(parsed);
      if (!message) {
        return;
      }

      emitEvent(message.event, message.payload);
    });

    ws.addEventListener('close', () => {
      socket = null;
      setStatus('closed');

      if (shouldReconnect && connectUrl) {
        reconnectTimer = setTimeout(() => {
          if (shouldReconnect && connectUrl) {
            openSocket(connectUrl);
          }
        }, 1000);
      }
    });

    ws.addEventListener('error', () => {
      ws.close();
    });
  };

  const openSocket = (url: string): void => {
    setStatus('connecting');
    const ws = new WebSocket(url);
    socket = ws;
    bindSocket(ws);
  };

  return {
    connect(url: string): void {
      shouldReconnect = true;
      connectUrl = url;

      if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
        return;
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      openSocket(url);
    },

    disconnect(): void {
      shouldReconnect = false;
      connectUrl = null;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (socket) {
        socket.close();
        socket = null;
      }

      setStatus('closed');
    },

    send<EventName extends keyof ClientToServerEventPayloads>(
      event: EventName,
      payload: ClientToServerEventPayloads[EventName],
    ): void {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      const message: ClientMessage = { event, payload } as ClientMessage;
      socket.send(JSON.stringify(message));
    },

    on<EventName extends keyof ServerToClientEventPayloads>(
      event: EventName,
      handler: ServerEventHandler<EventName>,
    ): () => void {
      let handlers = eventHandlers.get(event);
      if (!handlers) {
        handlers = new Set();
        eventHandlers.set(event, handlers);
      }

      const wrappedHandler = handler as (
        payload: ServerToClientEventPayloads[keyof ServerToClientEventPayloads],
      ) => void;
      handlers.add(wrappedHandler);

      return () => {
        handlers?.delete(wrappedHandler);
      };
    },

    onStatusChange(handler: StatusHandler): () => void {
      statusHandlers.add(handler);
      handler(status);

      return () => {
        statusHandlers.delete(handler);
      };
    },

    getStatus(): WsConnectionStatus {
      return status;
    },
  };
}

export function resolveWsUrl(override?: string): string {
  if (override) {
    return override;
  }

  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:3001`;
}
