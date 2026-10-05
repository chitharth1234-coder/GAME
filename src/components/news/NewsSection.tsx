import React, { useState } from 'react';
import { NewsPost } from '../../types';
import { Heart, ChevronRight } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface NewsSectionProps {
  articles: NewsPost[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ articles }) => {
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    return articles.reduce((acc, curr) => {
      acc[curr.id] = curr.likes;
      return acc;
    }, {} as Record<string, number>);
  });

  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    soundEngine.playUiClick();
    setHasLiked(prev => ({ ...prev, [id]: !prev[id] }));
    setLikes(prev => ({
      ...prev,
      [id]: hasLiked[id] ? prev[id] - 1 : prev[id] + 1
    }));
  };

  return (
    <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold block mb-1">
          PLATFORM INTEL
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-2">
          PATCH NOTES & FIELD DISPATCHES
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl">
          Weekly gameplay balances, audio engine updates, and competitive seasonal announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => {
          const isLiked = !!hasLiked[art.id];
          const isExpanded = expandedId === art.id;

          return (
            <article
              key={art.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-lg"
            >
              <div>
                {/* Zero-Pill unboxed metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
                  <span className="text-cyan-400">{art.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.readTime}</span>
                </div>

                <h3 className="text-xl font-bold font-display text-white mb-3 hover:text-cyan-400 transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className={`text-slate-400 text-xs leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setExpandedId(isExpanded ? null : art.id);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isExpanded ? 'Collapse Dispatch' : 'Read Full Dispatch'}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                <button
                  onClick={() => toggleLike(art.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    isLiked
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  aria-label="Like post"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                  <span className="font-mono tabular-nums">{likes[art.id]}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
