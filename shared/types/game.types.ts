export enum GameState {
  LOBBY = 'LOBBY',
  QUESTION_ACTIVE = 'QUESTION_ACTIVE',
  EVALUATING = 'EVALUATING',
  LEADERBOARD = 'LEADERBOARD',
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly isConnected: boolean;
}

export interface QuestionOption {
  readonly id: string;
  readonly text: string;
}

export interface Question {
  readonly id: string;
  readonly text: string;
  readonly options: readonly QuestionOption[];
  readonly correctOptionId: string;
}

export interface GameSnapshot {
  readonly phase: GameState;
  readonly players: readonly Player[];
  readonly currentQuestion: Question | null;
  readonly questionIndex: number;
  readonly totalQuestions: number;
}

/** Authoritative game state push from the server (`snapshot` WebSocket event). */
export type GameStateUpdate = GameSnapshot;

export interface PhaseChangedPayload {
  readonly phase: GameState;
  readonly snapshot: GameSnapshot;
}

export interface EvaluationCompletePayload {
  readonly questionId: string;
  readonly correctOptionId: string;
  readonly snapshot: GameSnapshot;
}

export interface JoinGamePayload {
  readonly playerName: string;
}

export interface SubmitAnswerPayload {
  readonly questionId: string;
  readonly optionId: string;
}

export type ServerToClientEventPayloads = {
  readonly snapshot: GameSnapshot;
  readonly playerUpdated: Player;
  readonly phaseChanged: PhaseChangedPayload;
  readonly questionStarted: Question;
  readonly evaluationComplete: EvaluationCompletePayload;
};

export type ClientToServerEventPayloads = {
  readonly joinGame: JoinGamePayload;
  readonly submitAnswer: SubmitAnswerPayload;
  readonly startGame: Record<string, never>;
  readonly nextQuestion: Record<string, never>;
};

export type ServerToClientEvents = Record<
  keyof ServerToClientEventPayloads,
  ServerToClientEventPayloads[keyof ServerToClientEventPayloads]
>;

export type ClientToServerEvents = Record<
  keyof ClientToServerEventPayloads,
  ClientToServerEventPayloads[keyof ClientToServerEventPayloads]
>;
