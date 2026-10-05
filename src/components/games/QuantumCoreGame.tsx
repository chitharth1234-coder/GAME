import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../../utils/audio';
import { Timer, RotateCcw, Zap, Sparkles, Trophy, Play, Pause } from 'lucide-react';

const GRID_SIZE = 8;
const CELL_TYPES = ['plasma', 'photon', 'darkmatter', 'tachyon', 'antimatter'] as const;
type CellType = typeof CELL_TYPES[number];

const CELL_COLORS: Record<CellType, { bg: string; border: string; glow: string; label: string; text: string }> = {
  plasma: { bg: 'bg-cyan-500/20', border: 'border-cyan-400/60', glow: 'shadow-cyan-500/30', label: 'Plasma', text: 'text-cyan-400' },
  photon: { bg: 'bg-amber-500/20', border: 'border-amber-400/60', glow: 'shadow-amber-500/30', label: 'Photon', text: 'text-amber-400' },
  darkmatter: { bg: 'bg-purple-500/20', border: 'border-purple-400/60', glow: 'shadow-purple-500/30', label: 'Dark Matter', text: 'text-purple-400' },
  tachyon: { bg: 'bg-emerald-500/20', border: 'border-emerald-400/60', glow: 'shadow-emerald-500/30', label: 'Tachyon', text: 'text-emerald-400' },
  antimatter: { bg: 'bg-rose-500/20', border: 'border-rose-400/60', glow: 'shadow-rose-500/30', label: 'Antimatter', text: 'text-rose-400' }
};

interface GridCell {
  id: string;
  type: CellType;
  isSpecial?: boolean;
}

interface QuantumCoreGameProps {
  onGameOver?: (score: number) => void;
  onClose?: () => void;
}

export const QuantumCoreGame: React.FC<QuantumCoreGameProps> = ({ onGameOver, onClose }) => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedIndices, setSelectedIndices] = useState<{ r: number; c: number }[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');
  const [combo, setCombo] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('vortex_quantum_highscore') || '0', 10);
  });

  const generateRandomCell = (): GridCell => ({
    id: Math.random().toString(36).substring(2, 9),
    type: CELL_TYPES[Math.floor(Math.random() * CELL_TYPES.length)],
    isSpecial: Math.random() < 0.05
  });

  const initializeGrid = () => {
    const newGrid: GridCell[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(generateRandomCell());
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  const startGame = () => {
    soundEngine.playUiClick();
    initializeGrid();
    setScore(0);
    setTimeLeft(60);
    setCombo(1);
    setSelectedIndices([]);
    setGameState('PLAYING');
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          soundEngine.playGameOver();
          setGameState('GAMEOVER');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Update high score on game over
  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('vortex_quantum_highscore', String(score));
      }
      if (onGameOver) onGameOver(score);
    }
  }, [gameState, score, highScore, onGameOver]);

  const areAdjacent = (p1: { r: number; c: number }, p2: { r: number; c: number }) => {
    const dr = Math.abs(p1.r - p2.r);
    const dc = Math.abs(p1.c - p2.c);
    return (dr <= 1 && dc <= 1) && !(dr === 0 && dc === 0);
  };

  const handleCellMouseDown = (r: number, c: number) => {
    if (gameState !== 'PLAYING') return;
    setIsDragging(true);
    setSelectedIndices([{ r, c }]);
    soundEngine.playMatchTone(1);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (!isDragging || gameState !== 'PLAYING') return;

    const last = selectedIndices[selectedIndices.length - 1];
    if (!last) return;

    // Check if moving backwards
    if (selectedIndices.length > 1) {
      const secondLast = selectedIndices[selectedIndices.length - 2];
      if (secondLast.r === r && secondLast.c === c) {
        setSelectedIndices(prev => prev.slice(0, -1));
        return;
      }
    }

    // Must be adjacent and match cell type
    const firstCell = grid[selectedIndices[0].r][selectedIndices[0].c];
    const currentCell = grid[r][c];

    const alreadyInChain = selectedIndices.some(pos => pos.r === r && pos.c === c);
    if (!alreadyInChain && areAdjacent(last, { r, c }) && currentCell.type === firstCell.type) {
      const newIndices = [...selectedIndices, { r, c }];
      setSelectedIndices(newIndices);
      soundEngine.playMatchTone(newIndices.length);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (selectedIndices.length >= 3) {
      // Valid collapse!
      soundEngine.playExplosion();
      const points = selectedIndices.length * 120 * combo;
      setScore(prev => prev + points);
      setCombo(prev => Math.min(prev + 1, 6));

      // Remove cells and drop down
      const newGrid = grid.map(row => [...row]);
      const matchedType = newGrid[selectedIndices[0].r][selectedIndices[0].c].type;

      // Mark matched cells as null
      selectedIndices.forEach(({ r, c }) => {
        (newGrid[r] as (GridCell | null)[])[c] = null;
      });

      // Drop down column by column
      for (let c = 0; c < GRID_SIZE; c++) {
        const remaining: GridCell[] = [];
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (newGrid[r][c] !== null) {
            remaining.push(newGrid[r][c]);
          }
        }
        // Fill top with new cells
        while (remaining.length < GRID_SIZE) {
          remaining.push(generateRandomCell());
        }
        // Place back bottom-to-top
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          newGrid[r][c] = remaining[GRID_SIZE - 1 - r];
        }
      }

      setGrid(newGrid);
    } else {
      // Reset combo if small break
      setCombo(1);
    }

    setSelectedIndices([]);
  };

  return (
    <div
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex flex-col items-center w-full max-w-4xl mx-auto select-none"
    >
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-5 py-3 text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 block">TIME REMAINING</span>
            <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-bold text-lg tabular-nums">
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">SCORE</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">HIGH SCORE</span>
            <span className="text-sm font-semibold font-mono text-slate-300 tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>

          {combo > 1 && (
            <div>
              <span className="text-xs text-emerald-400 block font-semibold">HARMONIC CHAIN</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {combo}X MULTIPLIER
              </span>
            </div>
          )}
        </div>

        <button
          onClick={startGame}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET GRID
        </button>
      </div>

      {/* Grid Container */}
      <div className="relative w-full aspect-square max-w-[560px] bg-slate-950 border-x border-b border-slate-800 rounded-b-xl p-4 flex items-center justify-center shadow-2xl">
        {/* The 8x8 Grid */}
        <div className="grid grid-cols-8 gap-1.5 w-full h-full max-w-[480px] max-h-[480px]">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selectedIndices.some(pos => pos.r === r && pos.c === c);
              const conf = CELL_COLORS[cell.type];

              return (
                <div
                  key={cell.id}
                  onMouseDown={() => handleCellMouseDown(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  className={`relative rounded-lg flex items-center justify-center cursor-pointer transition-all duration-100 border select-none ${
                    conf.bg
                  } ${conf.border} ${
                    isSelected
                      ? `scale-110 z-10 border-white ring-2 ring-white/60 ${conf.glow} shadow-lg`
                      : 'hover:border-slate-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${conf.bg} border ${conf.border}`} />
                  {cell.isSpecial && (
                    <Sparkles className="w-3 h-3 text-white absolute top-1 right-1" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* READY OVERLAY */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">GRIDLOCK: QUANTUM CORE</h2>
            <p className="text-slate-400 max-w-sm text-sm mb-6">
              Connect contiguous subatomic quantum nodes. Trigger resonant chain collapses before the 60s timer expires.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-lg text-sm flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              START 60S BLITZ
            </button>
          </div>
        )}

        {/* GAMEOVER OVERLAY */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <Trophy className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-3xl font-bold text-white mb-1">TIME EXPIRED</h3>
            <p className="text-slate-400 text-sm mb-6">Quantum core containment collapsed.</p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 w-64 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Score</span>
                <span className="font-mono font-bold text-amber-400 text-lg tabular-nums">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2">
                <span className="text-slate-400">Personal Best</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm cursor-pointer"
              >
                PLAY AGAIN
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-sm cursor-pointer"
                >
                  RETURN TO HUB
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between text-xs text-slate-500 px-2 py-3">
        <span>Click and drag across 3+ matching colored cells to trigger energetic collapses</span>
        <span>60-Second Blitz Rush</span>
      </div>
    </div>
  );
};
