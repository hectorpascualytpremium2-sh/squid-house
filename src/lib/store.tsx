import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  GameState,
  type GameSnapshot,
  type GameStateUpdate,
} from '../../shared/types/game.types';

import {
  createWsClient,
  GAME_STATE_UPDATE_EVENT,
  resolveWsUrl,
  type WsClient,
  type WsConnectionStatus,
} from './ws-client';

export type { GameStateUpdate, GameSnapshot };

export interface GameActions {
  readonly joinGame: (playerName: string) => void;
  readonly submitAnswer: (optionId: string) => void;
  readonly startGame: () => void;
  readonly nextPhase: () => void;
}

interface GameStoreState {
  readonly snapshot: GameSnapshot;
  readonly connectionStatus: WsConnectionStatus;
}

type StoreListener = () => void;

const INITIAL_SNAPSHOT: GameSnapshot = {
  phase: GameState.LOBBY,
  players: [],
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
};

function snapshotsEqual(previous: GameSnapshot, next: GameSnapshot): boolean {
  if (
    previous.phase !== next.phase ||
    previous.questionIndex !== next.questionIndex ||
    previous.totalQuestions !== next.totalQuestions ||
    previous.currentQuestion?.id !== next.currentQuestion?.id ||
    previous.players.length !== next.players.length
  ) {
    return false;
  }

  return previous.players.every((player, index) => {
    const nextPlayer = next.players[index];
    return (
      nextPlayer !== undefined &&
      player.id === nextPlayer.id &&
      player.name === nextPlayer.name &&
      player.score === nextPlayer.score &&
      player.isConnected === nextPlayer.isConnected
    );
  });
}

class GameStore {
  private snapshot: GameSnapshot = INITIAL_SNAPSHOT;
  private connectionStatus: WsConnectionStatus = 'idle';
  private client: WsClient | null = null;
  private readonly listeners = new Set<StoreListener>();
  private readonly unsubscribeHandlers: Array<() => void> = [];

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): GameSnapshot {
    return this.snapshot;
  }

  getConnectionStatus(): WsConnectionStatus {
    return this.connectionStatus;
  }

  connect(url: string): void {
    this.disconnect();

    const client = createWsClient();
    this.client = client;

    this.unsubscribeHandlers.push(
      client.on(GAME_STATE_UPDATE_EVENT, (gameStateUpdate: GameStateUpdate) => {
        this.setSnapshot(gameStateUpdate);
      }),
      client.onStatusChange((status) => {
        this.setConnectionStatus(status);
      }),
    );

    client.connect(url);
  }

  disconnect(): void {
    for (const unsubscribe of this.unsubscribeHandlers) {
      unsubscribe();
    }
    this.unsubscribeHandlers.length = 0;

    this.client?.disconnect();
    this.client = null;
    this.setConnectionStatus('closed');
  }

  joinGame(playerName: string): void {
    this.client?.send('joinGame', { playerName });
  }

  submitAnswer(optionId: string): void {
    const question = this.snapshot.currentQuestion;
    if (!question) {
      return;
    }

    this.client?.send('submitAnswer', {
      questionId: question.id,
      optionId,
    });
  }

  startGame(): void {
    this.client?.send('startGame', {});
  }

  nextPhase(): void {
    this.client?.send('nextQuestion', {});
  }

  private setSnapshot(nextSnapshot: GameSnapshot): void {
    if (snapshotsEqual(this.snapshot, nextSnapshot)) {
      return;
    }

    this.snapshot = nextSnapshot;
    this.notify();
  }

  private setConnectionStatus(nextStatus: WsConnectionStatus): void {
    if (this.connectionStatus === nextStatus) {
      return;
    }

    this.connectionStatus = nextStatus;
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

const GameStoreContext = createContext<GameStore | null>(null);

function useGameStoreContext(): GameStore {
  const store = useContext(GameStoreContext);
  if (!store) {
    throw new Error('useGameStore must be used within a GameStoreProvider');
  }
  return store;
}

export interface GameStoreProviderProps {
  readonly children: ReactNode;
  readonly wsUrl?: string;
}

export function GameStoreProvider({ children, wsUrl }: GameStoreProviderProps): JSX.Element {
  const storeRef = useRef<GameStore>();

  if (!storeRef.current) {
    storeRef.current = new GameStore();
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store) {
      return undefined;
    }

    store.connect(resolveWsUrl(wsUrl));

    return () => {
      store.disconnect();
    };
  }, [wsUrl]);

  return (
    <GameStoreContext.Provider value={storeRef.current}>
      {children}
    </GameStoreContext.Provider>
  );
}

export function useGameSnapshot(): GameSnapshot {
  const store = useGameStoreContext();

  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );
}

export function useGameConnectionStatus(): WsConnectionStatus {
  const store = useGameStoreContext();

  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getConnectionStatus(),
    () => store.getConnectionStatus(),
  );
}

export function useGameActions(): GameActions {
  const store = useGameStoreContext();

  return useMemo(
    () => ({
      joinGame: (playerName: string) => {
        store.joinGame(playerName);
      },
      submitAnswer: (optionId: string) => {
        store.submitAnswer(optionId);
      },
      startGame: () => {
        store.startGame();
      },
      nextPhase: () => {
        store.nextPhase();
      },
    }),
    [store],
  );
}

export function useGameStore(): GameStoreState & GameActions {
  const snapshot = useGameSnapshot();
  const connectionStatus = useGameConnectionStatus();
  const actions = useGameActions();

  return useMemo(
    () => ({
      snapshot,
      connectionStatus,
      ...actions,
    }),
    [snapshot, connectionStatus, actions],
  );
}

export function useGameStoreCleanup(): () => void {
  const store = useGameStoreContext();

  return useMemo(
    () => () => {
      store.disconnect();
    },
    [store],
  );
}
