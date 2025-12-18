import { useState, useEffect } from 'react';
import { QuizQuestion, GameState } from '../types';
import quizQuestionsData from '../data/quizQuestions.json';

interface QuizOwnerProps {
  gameState: GameState;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  onStartGame: () => void;
  onNextQuestion: () => void;
  onEndRound: () => void;
  onShowCorrectAnswer: (questionId: string) => void;
  onResetGame: () => void;
}

export default function QuizOwner({
  gameState,
  onUpdateGameState,
  onStartGame,
  onNextQuestion,
  onEndRound,
  onShowCorrectAnswer,
  onResetGame,
}: QuizOwnerProps) {
  const [currentQuestionData, setCurrentQuestionData] = useState<QuizQuestion | null>(null);
  const [scoreboard, setScoreboard] = useState<Array<{ teamId: string; score: number }>>([]);

  // Get current question
  useEffect(() => {
    if (gameState.currentRound && gameState.currentQuestion > 0) {
      const roundData = quizQuestionsData.rounds.find(r => r.roundNumber === gameState.currentRound);
      if (roundData && roundData.questions[gameState.currentQuestion - 1]) {
        setCurrentQuestionData(roundData.questions[gameState.currentQuestion - 1]);
      }
    }
  }, [gameState.currentRound, gameState.currentQuestion]);

  // Calculate scoreboard
  useEffect(() => {
    const scores: { [teamId: string]: number } = {};
    (gameState.teams || []).forEach(team => {
      scores[team.id] = 0;
      const teamAnswers = gameState.answers?.[team.id] || {};
      Object.keys(teamAnswers).forEach(() => {
        // Calculate score based on correct answers
        // This is simplified - you'd check against question data
        scores[team.id] += 10; // Placeholder
      });
    });
    setScoreboard(
      Object.entries(scores)
        .map(([teamId, score]) => ({ teamId, score }))
        .sort((a, b) => b.score - a.score)
    );
  }, [gameState.answers, gameState.teams]);

  const handleStartTimer = (duration: number = 30) => {
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    
    // Set initial timer state
    onUpdateGameState({
      timer: {
        active: true,
        timeLeft: duration,
        duration,
        endTime, // Store end time for sync
      },
    });

    // Client-side countdown (updates every second, syncs to Firebase)
    let timeLeft = duration;
    const interval = setInterval(() => {
      const now = Date.now();
      timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      // Update local state immediately for smooth UI
      onUpdateGameState({
        timer: {
          active: timeLeft > 0,
          timeLeft,
          duration,
          endTime,
        },
      });

      if (timeLeft <= 0) {
        clearInterval(interval);
        onUpdateGameState({
          timer: {
            active: false,
            timeLeft: 0,
            duration,
            endTime,
          },
        });
      }
    }, 1000);
  };

  const handleShowCorrect = () => {
    if (!currentQuestionData) return;
    onShowCorrectAnswer(currentQuestionData.id);
  };

  const roundData = quizQuestionsData.rounds.find(r => r.roundNumber === gameState.currentRound);
  const totalQuestions = roundData?.questions.length || 0;
  const isLastQuestion = gameState.currentQuestion >= totalQuestions;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        📋 Presenter Panel
      </h2>

      {/* Game Controls */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        {!gameState.gameStarted ? (
          <button
            onClick={onStartGame}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-glow-blue transition-all"
          >
            🚀 Start Game
          </button>
        ) : (
          <>
            {!isLastQuestion && (
              <button
                onClick={onNextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-glow-blue transition-all"
              >
                ➡️ Next Question
              </button>
            )}
            {isLastQuestion && (
              <button
                onClick={onEndRound}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-glow-blue transition-all"
              >
                🏴‍☠️ End Round
              </button>
            )}
            <button
              onClick={onResetGame}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all"
            >
              🔄 Reset Game
            </button>
          </>
        )}
      </div>

      {/* Timer */}
      {gameState.timer && (
        <div className="mb-6 text-center">
          <div className="text-4xl font-mono font-bold text-purple-400 mb-2">
            ⏱️ {gameState.timer.timeLeft}s
          </div>
          {!gameState.timer.active && (
            <button
              onClick={() => handleStartTimer(30)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Start Timer
            </button>
          )}
        </div>
      )}

      {/* Current Question */}
      {currentQuestionData && gameState.gameStarted && (
        <div className="mb-6 bg-gray-800 rounded-xl border border-purple-500/30 p-6">
          <div className="mb-4 text-sm text-gray-400">
            Round {gameState.currentRound} • Question {gameState.currentQuestion} / {totalQuestions}
          </div>
          <h3 className="text-2xl font-bold text-white mb-6">
            {currentQuestionData.question}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {currentQuestionData.options.map((option, idx) => {
              const isCorrect = gameState.questionState.correctAnswerShown && 
                               idx === currentQuestionData.correctAnswer;
              const letter = String.fromCharCode(65 + idx);
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? 'bg-green-600 border-green-400 text-white'
                      : 'bg-gray-900 border-purple-500/50 text-white'
                  }`}
                >
                  <div className="font-bold text-lg">
                    {letter}. {option}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Question Controls */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleShowCorrect}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              disabled={gameState.questionState.correctAnswerShown}
            >
              ✅ Show Correct Answer
            </button>
          </div>
        </div>
      )}

      {/* Teams */}
      <div className="mb-6 bg-gray-800 rounded-xl border border-purple-500/30 p-4">
        <h3 className="text-xl font-bold mb-4 text-gray-300">👥 Teams ({(gameState.teams || []).length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(gameState.teams || []).map(team => (
            <div key={team.id} className="p-2 bg-gray-900 rounded" style={{ borderLeft: `4px solid ${team.color}` }}>
              <span style={{ color: team.color }} className="font-semibold">{team.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scoreboard */}
      {scoreboard.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-purple-500/30 p-4">
          <h3 className="text-xl font-bold mb-4 text-gray-300">📊 Scoreboard</h3>
          <div className="space-y-2">
            {scoreboard.map((entry, index) => {
              const team = (gameState.teams || []).find(t => t.id === entry.teamId);
              return (
                <div key={entry.teamId} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                  <span>
                    {index + 1}. <span style={{ color: team?.color }} className="font-semibold">{team?.name}</span>
                  </span>
                  <span className="font-mono text-green-400">{entry.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

