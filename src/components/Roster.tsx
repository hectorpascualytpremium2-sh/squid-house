import { Player } from '../types';

interface RosterProps {
  players: Player[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
}

export default function Roster({
  players,
  selectedPlayerId,
  onSelectPlayer,
}: RosterProps) {
  if (players.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-lg">No players found matching your criteria.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Roster
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {players.map((player) => {
            const isSelected = selectedPlayerId === player.id;
            return (
              <button
                key={player.id}
                onClick={() => onSelectPlayer(player.id)}
                className={`relative p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  player.eliminated
                    ? 'opacity-60 border-gray-700'
                    : 'border-purple-500/50 hover:border-purple-400 shadow-lg hover:shadow-glow-purple'
                } ${isSelected ? 'ring-4 ring-purple-400 shadow-glow-pulse' : ''}`}
              >
                {/* Eliminated overlay */}
                {player.eliminated && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded shadow-glow-pink">
                    ELIMINATED
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 ${
                      player.eliminated
                        ? 'grayscale opacity-50 border-gray-600'
                        : 'border-purple-400 shadow-glow-purple'
                    }`}
                  >
                    <img
                      src={player.picture}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {player.eliminated && (
                      <div className="absolute inset-0 bg-red-500/20"></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-lg md:text-xl mb-1 truncate ${
                        player.eliminated ? 'text-gray-400' : 'text-white'
                      }`}
                    >
                      {player.name}
                    </h3>
                    <p className="text-sm text-gray-400">ID: {player.id}</p>
                    <p
                      className={`text-xs mt-1 ${
                        player.eliminated
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}
                    >
                      {player.eliminated ? 'Eliminated' : 'Alive'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}


