import { GameState } from '../types';
import { ref, set, get, remove, onValue, Unsubscribe } from 'firebase/database';
import { db } from '../config/firebase';

const GAME_STATE_PATH = 'quiz/gameState';

export const gameStateManager = {
  save: async (state: GameState): Promise<void> => {
    try {
      await set(ref(db, GAME_STATE_PATH), state);
    } catch (error) {
      console.error('Failed to save game state to Firebase:', error);
    }
  },

  load: async (): Promise<GameState | null> => {
    try {
      const snapshot = await get(ref(db, GAME_STATE_PATH));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Failed to load game state from Firebase:', error);
      return null;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await remove(ref(db, GAME_STATE_PATH));
    } catch (error) {
      console.error('Failed to clear game state from Firebase:', error);
    }
  },

  // Real-time subscription
  subscribe: (callback: (state: GameState | null) => void): Unsubscribe => {
    const gameStateRef = ref(db, GAME_STATE_PATH);
    
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      const state = snapshot.exists() ? snapshot.val() : null;
      callback(state);
    }, (error) => {
      console.error('Firebase subscription error:', error);
      callback(null);
    });

    return unsubscribe;
  },

  getInitialState: (): GameState => ({
    gameStarted: false,
    currentRound: 1,
    currentQuestion: 0,
    timer: null,
    questionState: {
      questionId: null,
      correctAnswerShown: false,
    },
    teams: [],
    answers: {},
  }),
};

