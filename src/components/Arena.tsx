import { useMemo, useRef, useState, useEffect } from 'react';
import { Player } from '../types';

interface ArenaProps {
  players: Player[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
}

// Spiral layout algorithm
function getSpiralPosition(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 * 3; // 3 full rotations
  const distance = (index / total) * radius;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  return { x, y };
}

export default function Arena({ players, selectedPlayerId, onSelectPlayer }: ArenaProps) {
  const arenaSize = 1200; // Larger arena for navigation
  const maxRadius = arenaSize * 0.4;
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  const positionedPlayers = useMemo(() => {
    return players.map((player, index) => {
      const { x, y } = getSpiralPosition(index, players.length, maxRadius);
      return {
        ...player,
        x: x + arenaSize / 2,
        y: y + arenaSize / 2,
      };
    });
  }, [players, maxRadius]);

  const aliveCount = players.filter((p) => !p.eliminated).length;
  const eliminatedCount = players.filter((p) => p.eliminated).length;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom * delta));
    setZoom(newZoom);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev / 1.2));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Center on selected player
  useEffect(() => {
    if (selectedPlayerId && containerRef.current) {
      const player = positionedPlayers.find((p) => p.id === selectedPlayerId);
      if (player) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        setPan({
          x: centerX - player.x * zoom,
          y: centerY - player.y * zoom,
        });
        setZoom(1.5);
      }
    }
  }, [selectedPlayerId, positionedPlayers, zoom]);

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          The Arena
        </h2>

        {/* Legend and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-glow-blue"></div>
              <span className="text-gray-300">Alive ({aliveCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 opacity-50"></div>
              <span className="text-gray-300">Eliminated ({eliminatedCount})</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-purple-500/50 transition-all"
              aria-label="Zoom out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-gray-300 text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-purple-500/50 transition-all"
              aria-label="Zoom in"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <button
              onClick={handleResetView}
              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all text-sm font-medium"
              aria-label="Reset view"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-4 text-sm text-gray-400">
          <p className="hidden md:block">🖱️ Drag to pan • Scroll to zoom • Click players to view details</p>
          <p className="md:hidden">👆 Drag to pan • Pinch to zoom • Tap players to view details</p>
        </div>

        {/* Arena Panel */}
        <div className="relative mx-auto rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-4 md:p-8 border-2 border-purple-500/30 shadow-glow-purple overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-[400px] md:h-[600px] overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Arena Content */}
            <div
              className="absolute inset-0 origin-top-left"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              {/* Grid background */}
              <div
                className="absolute opacity-10"
                style={{
                  width: `${arenaSize}px`,
                  height: `${arenaSize}px`,
                  backgroundImage: `
                    linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Player tokens */}
              {positionedPlayers.map((player) => {
                const isSelected = selectedPlayerId === player.id;
                const isHovered = hoveredPlayerId === player.id;
                return (
                  <button
                    key={player.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlayer(player.id);
                    }}
                    onMouseEnter={() => setHoveredPlayerId(player.id)}
                    onMouseLeave={() => setHoveredPlayerId(null)}
                    className="group absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full z-10"
                    style={{
                      left: `${player.x}px`,
                      top: `${player.y}px`,
                      transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.3)' : isHovered ? 'scale(1.15)' : 'scale(1)'}`,
                    }}
                    aria-label={`View ${player.name}`}
                  >
                    <div className="relative">
                      {/* Selected ring */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full border-4 border-purple-400 shadow-glow-pulse animate-pulse-glow -m-2"></div>
                      )}

                      {/* Hover ring */}
                      {isHovered && !isSelected && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400 shadow-glow-blue -m-1 animate-pulse"></div>
                      )}

                      {/* Avatar */}
                      <div
                        className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all ${
                          player.eliminated
                            ? 'grayscale opacity-40 border-gray-600'
                            : 'border-purple-400 shadow-glow-purple'
                        } ${isSelected ? 'ring-4 ring-purple-400' : ''} ${
                          isHovered && !player.eliminated ? 'shadow-glow-blue' : ''
                        }`}
                      >
                        <img
                          src={player.picture}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Eliminated badge */}
                        {player.eliminated && (
                          <>
                            <div className="absolute inset-0 bg-red-500/20"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-[8px] md:text-xs font-bold px-2 py-0.5 rounded shadow-glow-pink transform -rotate-12">
                                ELIMINATED
                              </div>
                            </div>
                            {/* Diagonal strike */}
                            <div className="absolute inset-0">
                              <svg className="w-full h-full">
                                <line
                                  x1="0"
                                  y1="0"
                                  x2="100%"
                                  y2="100%"
                                  stroke="rgba(239, 68, 68, 0.8)"
                                  strokeWidth="2"
                                />
                              </svg>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Player ID badge */}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-purple-500/50 text-purple-300 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                        {player.id}
                      </div>

                      {/* Tooltip on hover (desktop) */}
                      <div className="hidden md:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-purple-500/50">
                        {player.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

