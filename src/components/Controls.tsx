import { Filter } from '../types';

interface ControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export default function Controls({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
}: ControlsProps) {
  return (
    <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30 shadow-lg py-4 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex gap-2">
            {(['all', 'alive', 'eliminated'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  filter === f
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow-purple'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


