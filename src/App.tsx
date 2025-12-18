import { useState, useMemo, useEffect } from 'react';
import playersData from './data/players.json';
import quizQuestionsData from './data/quizQuestions.json';
import { Player, Filter, Team } from './types';
import Hero from './components/Hero';
import Arena from './components/Arena';
import Controls from './components/Controls';
import Roster from './components/Roster';
import PlayerModal from './components/PlayerModal';
import QuizOwner from './components/QuizOwner';
import QuizTeam from './components/QuizTeam';
import PasswordModal from './components/PasswordModal';
import RoleSelector from './components/RoleSelector';
import LandingScreen from './components/LandingScreen';
import { gameStateManager } from './utils/gameStateManager';
import { UserRole, GameState } from './types';

// Validate player data
function validatePlayer(player: any): player is Player {
  return (
    typeof player === 'object' &&
    player !== null &&
    typeof player.id === 'string' &&
    typeof player.name === 'string' &&
    typeof player.picture === 'string' &&
    typeof player.eliminated === 'boolean'
  );
}

type AppMode = 'roster' | 'quiz-live';

function App() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [dataError, setDataError] = useState<string | null>(null);
  
  // App mode
  const [appMode, setAppMode] = useState<AppMode>('roster');
  
  // Live quiz game state
  const [gameState, setGameState] = useState<GameState>(gameStateManager.getInitialState());
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [hasEnteredPassword, setHasEnteredPassword] = useState(false);

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const unsubscribe = gameStateManager.subscribe((state) => {
      if (state) {
        setGameState(state);
      } else {
        // If no state exists, initialize with default
        const initialState = gameStateManager.getInitialState();
        setGameState(initialState);
        gameStateManager.save(initialState);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  // Validate all players
  const players = useMemo(() => {
    try {
      const validated = playersData.filter(validatePlayer);
      if (validated.length !== playersData.length) {
        setDataError('Some players have invalid data. Showing valid players only.');
      } else {
        setDataError(null);
      }
      return validated;
    } catch (error) {
      setDataError('Failed to load player data. Please check the data file.');
      return [];
    }
  }, []);

  // Filter and search players
  const filteredPlayers = useMemo(() => {
    let result = players;

    // Apply filter
    if (filter === 'alive') {
      result = result.filter((p) => !p.eliminated);
    } else if (filter === 'eliminated') {
      result = result.filter((p) => p.eliminated);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [players, filter, searchQuery]);

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) || null,
    [players, selectedPlayerId]
  );

  const handleEnterArena = () => {
    document.getElementById('arena')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Live quiz game handlers
  const handleUpdateGameState = async (updates: Partial<GameState>) => {
    setGameState((prevState) => {
      const newState = { ...prevState, ...updates };
      // Save to Firebase asynchronously
      gameStateManager.save(newState).catch((error) => {
        console.error('Failed to save game state:', error);
      });
      return newState;
    });
  };

  const handleStartGame = () => {
    handleUpdateGameState({
      gameStarted: true,
      currentRound: gameState.currentRound || 1,
      currentQuestion: 1,
      questionState: {
        questionId: null,
        correctAnswerShown: false,
      },
    });
  };

  const handleNextQuestion = () => {
    handleUpdateGameState({
      currentQuestion: gameState.currentQuestion + 1,
      questionState: {
        questionId: null,
        correctAnswerShown: false,
      },
      timer: null,
    });
  };

  const handleEndRound = () => {
    handleUpdateGameState({
      gameStarted: false,
      currentQuestion: 0,
    });
  };

  const handleShowCorrectAnswer = (questionId: string) => {
    handleUpdateGameState({
      questionState: {
        ...gameState.questionState,
        questionId,
        correctAnswerShown: true,
      },
    });
  };

  const handleResetGame = async () => {
    const initialState = gameStateManager.getInitialState();
    setGameState(initialState);
    await gameStateManager.clear();
    await gameStateManager.save(initialState);
  };

  const handleJoinTeam = (teamName: string) => {
    const colors = ['#a855f7', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    const currentTeams = gameState.teams || [];
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamName,
      memberIds: [],
      color: colors[currentTeams.length % colors.length],
    };
    
    handleUpdateGameState({
      teams: [...currentTeams, newTeam],
    });
    
    setCurrentTeamId(newTeam.id);
    setUserRole('team');
  };

  const handleSubmitAnswer = (answer: number) => {
    if (!currentTeamId) return;
    
    const roundData = quizQuestionsData.rounds.find(r => r.roundNumber === gameState.currentRound);
    const question = roundData?.questions[gameState.currentQuestion - 1];
    if (!question) return;

    const newAnswers = { ...(gameState.answers || {}) };
    if (!newAnswers[currentTeamId]) {
      newAnswers[currentTeamId] = {};
    }
    
    newAnswers[currentTeamId][question.id] = {
      answer,
      timestamp: Date.now(),
    };

    handleUpdateGameState({
      answers: newAnswers,
    });
  };

  const handleEnterAsOwner = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    setUserRole('owner');
    setAppMode('quiz-live');
  };

  const handleEnterAsTeam = () => {
    setUserRole('team');
    setAppMode('quiz-live');
  };

  // Navigation menu
  const Navigation = () => (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setAppMode('roster')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              appMode === 'roster'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow-purple'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => {
              if (appMode !== 'quiz-live') {
                setShowRoleSelector(true);
              } else {
                setAppMode('roster');
                setUserRole(null);
                setCurrentTeamId(null);
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              appMode === 'quiz-live'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-glow-purple'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {appMode === 'quiz-live' ? 'Exit Live' : 'Live Quiz'}
          </button>
        </div>
      </div>
    </nav>
  );

  if (!hasEnteredPassword) {
    return <LandingScreen onEnter={() => setHasEnteredPassword(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {dataError && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-900/90 text-yellow-100 px-4 py-3 rounded-lg shadow-lg border border-yellow-700">
          <p className="text-sm">{dataError}</p>
        </div>
      )}

      <Navigation />

      {appMode === 'roster' && (
        <>
          <Hero onEnterArena={handleEnterArena} />

          <div id="arena" className="scroll-mt-20">
            <Arena
              players={filteredPlayers}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
            />
          </div>

          <div id="roster" className="scroll-mt-20">
            <Controls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
            />
            <Roster
              players={filteredPlayers}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
            />
          </div>
        </>
      )}

      {appMode === 'quiz-live' && (
        <div className="py-12 px-4">
          {userRole === 'owner' ? (
            <QuizOwner
              gameState={gameState}
              onUpdateGameState={handleUpdateGameState}
              onStartGame={handleStartGame}
              onNextQuestion={handleNextQuestion}
              onEndRound={handleEndRound}
              onShowCorrectAnswer={handleShowCorrectAnswer}
              onResetGame={handleResetGame}
            />
          ) : (
            <QuizTeam
              gameState={gameState}
              teamId={currentTeamId}
              onJoinTeam={handleJoinTeam}
              onSubmitAnswer={handleSubmitAnswer}
            />
          )}
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
        title="Presenter Access"
        message="Enter password to access the presenter panel"
      />

      <RoleSelector
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
        onSelectOwner={handleEnterAsOwner}
        onSelectTeam={handleEnterAsTeam}
      />
    </div>
  );
}

export default App;


