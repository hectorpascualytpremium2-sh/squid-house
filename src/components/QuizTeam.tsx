import { useState, useEffect } from 'react';
import { GameState, QuizQuestion } from '../types';
import quizQuestionsData from '../data/quizQuestions.json';

interface QuizTeamProps {
  gameState: GameState;
  teamId: string | null;
  onJoinTeam: (teamName: string) => void;
  onSubmitAnswer: (answer: number) => void;
}

export default function QuizTeam({ gameState, teamId, onJoinTeam, onSubmitAnswer }: QuizTeamProps) {
  const [teamName, setTeamName] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSent, setAnswerSent] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState<QuizQuestion | null>(null);
  const [localTimeLeft, setLocalTimeLeft] = useState<number | null>(null);

  const team = teamId ? (gameState.teams || []).find(t => t.id === teamId) : null;
  const joined = !!teamId && !!team;

  // Get current question
  useEffect(() => {
    if (gameState.currentRound && gameState.currentQuestion > 0) {
      const roundData = quizQuestionsData.rounds.find(r => r.roundNumber === gameState.currentRound);
      if (roundData && roundData.questions[gameState.currentQuestion - 1]) {
        setCurrentQuestionData(roundData.questions[gameState.currentQuestion - 1]);
      }
    }
  }, [gameState.currentRound, gameState.currentQuestion]);

  // Reset answer state on new question
  useEffect(() => {
    if (gameState.currentQuestion > 0) {
      setSelectedAnswer(null);
      setAnswerSent(false);
      setLocalTimeLeft(null);
    }
  }, [gameState.currentQuestion]);

  // Sync timer with Firebase, but use local countdown for smooth UI
  useEffect(() => {
    if (!gameState.timer) {
      setLocalTimeLeft(null);
      return;
    }

    // If timer has endTime, calculate remaining time
    if (gameState.timer.endTime) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((gameState.timer!.endTime! - now) / 1000));
        setLocalTimeLeft(remaining);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 100);
      
      return () => clearInterval(interval);
    } else {
      // Fallback to Firebase timeLeft
      setLocalTimeLeft(gameState.timer.timeLeft);
    }
  }, [gameState.timer]);

  const handleJoin = () => {
    if (teamName.trim()) {
      onJoinTeam(teamName.trim());
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (answerSent || !gameState.timer?.active) return;
    setSelectedAnswer(answerIndex);
    onSubmitAnswer(answerIndex);
    setAnswerSent(true);
  };

  const isOptionDisabled = () => {
    return !gameState.timer?.active || answerSent;
  };

  const isCorrect = (index: number) => {
    return gameState.questionState.correctAnswerShown && 
           currentQuestionData && 
           index === currentQuestionData.correctAnswer;
  };

  if (!joined) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl border border-purple-500/30">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          📲 Join Quiz
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full px-4 py-3 bg-gray-900 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleJoin}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-glow-purple hover:shadow-glow-blue transition-all"
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Team Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: team?.color }}>
          {team?.name}
        </h2>
        {selectedAnswer !== null && answerSent && (
          <p className="text-gray-400">
            You answered: <strong className="text-white">
              {String.fromCharCode(65 + selectedAnswer)}
            </strong>
          </p>
        )}
      </div>

      {/* Timer */}
      {(gameState.timer || localTimeLeft !== null) && (
        <div className="mb-6 text-center">
          <div className={`text-5xl font-mono font-bold mb-2 ${
            gameState.timer?.active 
              ? 'text-purple-400 animate-pulse' 
              : 'text-gray-500'
          }`}>
            ⏱️ {localTimeLeft !== null ? localTimeLeft : gameState.timer?.timeLeft || 0}s
          </div>
          {!gameState.timer?.active && (
            <p className="text-gray-400">Time's up!</p>
          )}
        </div>
      )}

      {/* Current Question */}
      {gameState.gameStarted && currentQuestionData && (
        <div className="mb-6 bg-gray-800 rounded-xl border border-purple-500/30 p-6">
          <div className="mb-4 text-sm text-gray-400 text-center">
            Round {gameState.currentRound} • Question {gameState.currentQuestion}
          </div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {currentQuestionData.question}
          </h3>

          {/* Answer Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentQuestionData.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const disabled = isOptionDisabled();
              const correct = isCorrect(index);
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={disabled}
                  className={`
                    p-6 rounded-lg border-2 font-bold text-xl transition-all
                    ${correct
                      ? 'bg-green-600 border-green-400 text-white'
                      : disabled
                      ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                      : gameState.timer?.active
                      ? 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500 hover:shadow-glow-purple'
                      : 'bg-gray-700 border-gray-600 text-gray-500'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{letter}</div>
                  <div>{option}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!gameState.gameStarted && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">Waiting for game to start...</p>
        </div>
      )}
    </div>
  );
}

