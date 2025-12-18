export type Player = {
  id: string;
  name: string;
  picture: string;
  eliminated: boolean;
};

export type Filter = 'all' | 'alive' | 'eliminated';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  category?: string;
};

export type Team = {
  id: string;
  name: string;
  memberIds: string[];
  color: string;
};

export type GameState = {
  gameStarted: boolean;
  currentRound: number;
  currentQuestion: number;
  timer: {
    active: boolean;
    timeLeft: number;
    duration: number; // seconds
    endTime?: number; // timestamp when timer ends (for sync)
  } | null;
  questionState: {
    questionId: string | null;
    correctAnswerShown: boolean;
  };
  teams: Team[];
  answers: {
    [teamId: string]: {
      [questionId: string]: {
        answer: number;
        timestamp: number;
      };
    };
  };
};

export type UserRole = 'owner' | 'team' | null;
