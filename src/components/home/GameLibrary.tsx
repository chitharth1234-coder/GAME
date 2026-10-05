import React, { useState } from 'react';
import { GameItem, GameCategory } from '../../types';
import { Play, Star, Users, Info, Search, Filter } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface GameLibraryProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onViewDetails: (game: GameItem) => void;
  userHighScores: Record<string, number>;
}

export const GameLibrary: React.FC<GameLibraryProps> = ({
  games,
  onSelectGame,
  onViewDetails,
  userHighScores
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'score'>('popular');

  const filteredGames = games
    .filter(g => {
      const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
      const matchesSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'score') return (userHighScores[b.id] || 0) - (userHighScores[a.id] || 0);
      return b.playCount - a.playCount;
    });

  return (
    <section id="games" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold block mb-1">
            ARCADE COLLECTION
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
            PLAYABLE BROWSER TITLES
          </h2>
        </div>

        {/* Filter Tabs (Interactive segmented buttons allowed by constitution) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Titles
          </button>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedCategory('space-action');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'space-action'
                ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Space Action
          </button>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedCategory('tactical-deck');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'tactical-deck'
                ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactical Deck
          </button>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedCategory('arcade-puzzle');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'arcade-puzzle'
                ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Arcade Puzzle
          </button>
        </div>
      </div>

      {/* Search and Secondary Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, mechanics..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-slate-400">
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'score')}
            aria-label="Sort games by"
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="score">Personal High Score</option>
          </select>
        </div>
      </div>

      {/* Games Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames.map((game) => {
          const userScore = userHighScores[game.id] || 0;

          return (
            <div
              key={game.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-lg hover:-translate-y-1"
            >
              {/* Cover Art with Zero-Broken-Image Fallback Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to styled CSS container
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Quick launch overlay on hover */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      soundEngine.playUiClick();
                      onSelectGame(game);
                    }}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-lg transform scale-95 group-hover:scale-100 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    PLAY NOW
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playUiClick();
                      onViewDetails(game);
                    }}
                    className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white font-medium rounded-lg border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    DETAILS
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Clean unboxed metadata with dot separators (Zero-Pill compliant) */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="text-cyan-400 font-medium">{game.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{game.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      {game.rating}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {game.title}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                    {game.tagline}
                  </p>
                </div>

                {/* Score & Controls Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">YOUR BEST</span>
                    <span className="font-mono font-bold text-slate-200 tabular-nums">
                      {userScore > 0 ? userScore.toLocaleString() : 'Unplayed'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playUiClick();
                      onSelectGame(game);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    PLAY
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
