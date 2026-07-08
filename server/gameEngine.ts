import {
  GameState,
  type GameSnapshot,
  type JoinGamePayload,
  type Player,
  type SubmitAnswerPayload,
} from '../shared/types/game.types.js';

import type { QuestionManager } from './questionManager.js';

type MutationListener = (snapshot: GameSnapshot) => void;

const POINTS_PER_CORRECT_ANSWER = 10;

export class GameEngine {
  private readonly players = new Map<string, Player>();
  private readonly answersByPlayer = new Map<string, Map<string, string>>();
  private readonly questionManager: QuestionManager;
  private phase: GameState = GameState.LOBBY;
  private questionIndex = 0;
  private mutationListener: MutationListener | null = null;

  constructor(questionManager: QuestionManager, initialPlayers: readonly Player[] = []) {
    this.questionManager = questionManager;

    for (const player of initialPlayers) {
      this.players.set(player.id, {
        ...player,
        isConnected: false,
      });
    }
  }

  onMutation(listener: MutationListener): void {
    this.mutationListener = listener;
  }

  getSnapshot(): GameSnapshot {
    return {
      phase: this.phase,
      players: [...this.players.values()].sort((left, right) => right.score - left.score),
      currentQuestion: this.questionManager.getQuestion(this.questionIndex),
      questionIndex: this.questionIndex,
      totalQuestions: this.questionManager.getTotalQuestions(),
    };
  }

  joinGame(connectionId: string, payload: JoinGamePayload): Player {
    const trimmedName = payload.playerName.trim();
    if (!trimmedName) {
      throw new Error('Player name is required');
    }

    const player: Player = {
      id: connectionId,
      name: trimmedName,
      score: this.players.get(connectionId)?.score ?? 0,
      isConnected: true,
    };

    this.players.set(connectionId, player);
    this.emitMutation();
    return player;
  }

  setPlayerConnected(playerId: string, isConnected: boolean): void {
    const player = this.players.get(playerId);
    if (!player) {
      return;
    }

    this.players.set(playerId, { ...player, isConnected });
    this.emitMutation();
  }

  startGame(): void {
    if (this.phase !== GameState.LOBBY && this.phase !== GameState.LEADERBOARD) {
      return;
    }

    this.questionIndex = 0;
    this.answersByPlayer.clear();
    this.phase = GameState.QUESTION_ACTIVE;
    this.emitMutation();
  }

  submitAnswer(playerId: string, payload: SubmitAnswerPayload): void {
    if (this.phase !== GameState.QUESTION_ACTIVE) {
      return;
    }

    const currentQuestion = this.questionManager.getQuestion(this.questionIndex);
    if (!currentQuestion || currentQuestion.id !== payload.questionId) {
      return;
    }

    if (!this.players.has(playerId)) {
      return;
    }

    const validOption = currentQuestion.options.some(
      (option) => option.id === payload.optionId,
    );
    if (!validOption) {
      return;
    }

    let playerAnswers = this.answersByPlayer.get(playerId);
    if (!playerAnswers) {
      playerAnswers = new Map<string, string>();
      this.answersByPlayer.set(playerId, playerAnswers);
    }

    playerAnswers.set(payload.questionId, payload.optionId);
    this.emitMutation();
  }

  nextQuestion(): void {
    if (this.phase === GameState.QUESTION_ACTIVE) {
      this.evaluateCurrentQuestion();
      return;
    }

    if (this.phase !== GameState.LEADERBOARD) {
      return;
    }

    const totalQuestions = this.questionManager.getTotalQuestions();
    if (this.questionIndex + 1 >= totalQuestions) {
      this.emitMutation();
      return;
    }

    this.questionIndex += 1;
    this.phase = GameState.QUESTION_ACTIVE;
    this.emitMutation();
  }

  private evaluateCurrentQuestion(): void {
    const question = this.questionManager.getQuestion(this.questionIndex);
    if (!question) {
      return;
    }

    this.phase = GameState.EVALUATING;

    for (const [playerId, answers] of this.answersByPlayer) {
      const selectedOptionId = answers.get(question.id);
      if (selectedOptionId !== question.correctOptionId) {
        continue;
      }

      const player = this.players.get(playerId);
      if (!player) {
        continue;
      }

      this.players.set(playerId, {
        ...player,
        score: player.score + POINTS_PER_CORRECT_ANSWER,
      });
    }

    this.phase = GameState.LEADERBOARD;
    this.emitMutation();
  }

  private emitMutation(): void {
    this.mutationListener?.(this.getSnapshot());
  }
}
