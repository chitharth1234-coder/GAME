import React, { useState, useEffect } from 'react';
import { soundEngine } from '../../utils/audio';
import { Shield, Zap, Sparkles, AlertCircle, RefreshCw, Trophy, RotateCcw, Swords, Cpu } from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'power' | 'special';
  cost: number;
  value: number;
  description: string;
  glowColor: string;
}

interface EnemyNode {
  name: string;
  maxHp: number;
  hp: number;
  shield: number;
  intent: {
    type: 'attack' | 'defend' | 'buff';
    value: number;
    label: string;
  };
}

const CARD_POOL: Card[] = [
  { id: 'c1', name: 'Plasma Strike', type: 'attack', cost: 1, value: 8, description: 'Deal 8 plasma damage to the core mainframe.', glowColor: 'border-cyan-500/50' },
  { id: 'c2', name: 'Nanite Shield', type: 'defense', cost: 1, value: 7, description: 'Deploy 7 nanite kinetic block against upcoming attacks.', glowColor: 'border-blue-500/50' },
  { id: 'c3', name: 'Overclock', type: 'power', cost: 0, value: 2, description: 'Gain 2 energy this turn. Take 3 self-recoil damage.', glowColor: 'border-amber-500/50' },
  { id: 'c4', name: 'EMP Overload', type: 'attack', cost: 2, value: 16, description: 'Release high-voltage pulse dealing 16 direct damage.', glowColor: 'border-purple-500/50' },
  { id: 'c5', name: 'Sub-Routine Firewall', type: 'defense', cost: 2, value: 14, description: 'Erect an impenetrable 14-point intrusion barrier.', glowColor: 'border-emerald-500/50' },
  { id: 'c6', name: 'Quantum Spike', type: 'special', cost: 1, value: 10, description: 'Deal 10 damage. Draw 1 additional program card.', glowColor: 'border-rose-500/50' }
];

const INITIAL_DECK: Card[] = [
  CARD_POOL[0], CARD_POOL[0], CARD_POOL[0],
  CARD_POOL[1], CARD_POOL[1], CARD_POOL[1],
  CARD_POOL[2], CARD_POOL[3]
];

interface NeonDeckGameProps {
  onGameOver?: (score: number) => void;
  onVictory?: (score: number) => void;
  onClose?: () => void;
}

export const NeonDeckGame: React.FC<NeonDeckGameProps> = ({ onGameOver, onVictory, onClose }) => {
  const [sector, setSector] = useState<number>(1);
  const [playerHp, setPlayerHp] = useState<number>(65);
  const [maxPlayerHp] = useState<number>(65);
  const [playerShield, setPlayerShield] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(3);
  const [maxEnergy] = useState<number>(3);

  const [deck, setDeck] = useState<Card[]>(() => [...INITIAL_DECK]);
  const [hand, setHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [enemy, setEnemy] = useState<EnemyNode>({
    name: 'Sector 01 Sub-Routine Bot',
    maxHp: 45,
    hp: 45,
    shield: 0,
    intent: { type: 'attack', value: 8, label: 'Attacking for 8 DMG' }
  });

  const [battleLog, setBattleLog] = useState<string[]>(['Infiltration sequence initiated. Mainframe node online.']);
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [status, setStatus] = useState<'READY' | 'PLAYING' | 'VICTORY' | 'GAMEOVER'>('PLAYING');
  const [score, setScore] = useState<number>(0);

  // Initialize hand
  const drawCards = (count: number, currentDeck = deck, currentDiscard = discardPile) => {
    let newDeck = [...currentDeck];
    let newDiscard = [...currentDiscard];
    const drawn: Card[] = [];

    for (let i = 0; i < count; i++) {
      if (newDeck.length === 0) {
        if (newDiscard.length === 0) break;
        newDeck = [...newDiscard].sort(() => Math.random() - 0.5);
        newDiscard = [];
      }
      const card = newDeck.pop();
      if (card) drawn.push(card);
    }

    setDeck(newDeck);
    setDiscardPile(newDiscard);
    setHand(prev => [...prev, ...drawn]);
  };

  useEffect(() => {
    // Start game first draw
    drawCards(4, [...INITIAL_DECK], []);
  }, []);

  const addLog = (msg: string) => {
    setBattleLog(prev => [msg, ...prev.slice(0, 5)]);
  };

  const playCard = (card: Card) => {
    if (turn !== 'PLAYER' || energy < card.cost || status !== 'PLAYING') return;

    soundEngine.playCardPlay();
    setEnergy(prev => prev - card.cost);
    setHand(prev => prev.filter(c => c !== card));
    setDiscardPile(prev => [...prev, card]);

    if (card.type === 'attack') {
      let dmg = card.value;
      let newEnemyShield = enemy.shield;
      let newEnemyHp = enemy.hp;

      if (newEnemyShield > 0) {
        if (newEnemyShield >= dmg) {
          newEnemyShield -= dmg;
          dmg = 0;
          soundEngine.playShieldHit();
        } else {
          dmg -= newEnemyShield;
          newEnemyShield = 0;
          newEnemyHp -= dmg;
          soundEngine.playExplosion();
        }
      } else {
        newEnemyHp -= dmg;
        soundEngine.playExplosion();
      }

      addLog(`You cast ${card.name} dealing ${card.value} damage!`);
      setEnemy(prev => ({ ...prev, hp: Math.max(0, newEnemyHp), shield: newEnemyShield }));
      setScore(prev => prev + card.value * 20);

      if (newEnemyHp <= 0) {
        handleSectorVictory();
        return;
      }
    } else if (card.type === 'defense') {
      soundEngine.playShieldHit();
      setPlayerShield(prev => prev + card.value);
      addLog(`You generated +${card.value} Nanite Barrier.`);
    } else if (card.type === 'power') {
      // Overclock
      setEnergy(prev => prev + card.value);
      setPlayerHp(prev => Math.max(1, prev - 3));
      addLog(`Overclock: Gained +2 Energy, suffered 3 self-damage.`);
    } else if (card.type === 'special') {
      // Quantum Spike
      let dmg = card.value;
      let newEnemyHp = Math.max(0, enemy.hp - dmg);
      soundEngine.playExplosion();
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      drawCards(1);
      addLog(`Quantum Spike struck node for ${card.value} DMG and drew 1 card.`);

      if (newEnemyHp <= 0) {
        handleSectorVictory();
        return;
      }
    }
  };

  const endTurn = () => {
    if (turn !== 'PLAYER' || status !== 'PLAYING') return;
    soundEngine.playUiClick();
    setTurn('ENEMY');
    setSelectedCard(null);

    // Discard remaining hand
    setDiscardPile(prev => [...prev, ...hand]);
    setHand([]);

    // Bot AI turn with realistic delay
    setTimeout(() => {
      executeEnemyTurn();
    }, 800);
  };

  const executeEnemyTurn = () => {
    const intent = enemy.intent;

    if (intent.type === 'attack') {
      let dmg = intent.value;
      let newPlayerShield = playerShield;
      let newPlayerHp = playerHp;

      if (newPlayerShield > 0) {
        if (newPlayerShield >= dmg) {
          newPlayerShield -= dmg;
          dmg = 0;
          soundEngine.playShieldHit();
        } else {
          dmg -= newPlayerShield;
          newPlayerShield = 0;
          newPlayerHp -= dmg;
          soundEngine.playExplosion();
        }
      } else {
        newPlayerHp -= dmg;
        soundEngine.playExplosion();
      }

      setPlayerShield(newPlayerShield);
      setPlayerHp(Math.max(0, newPlayerHp));
      addLog(`${enemy.name} executed ${intent.label}!`);

      if (newPlayerHp <= 0) {
        soundEngine.playGameOver();
        setStatus('GAMEOVER');
        if (onGameOver) onGameOver(score);
        return;
      }
    } else if (intent.type === 'defend') {
      soundEngine.playShieldHit();
      setEnemy(prev => ({ ...prev, shield: prev.shield + intent.value }));
      addLog(`${enemy.name} erected a +${intent.value} Firewall.`);
    }

    // Prepare next turn
    const nextAttacks = [
      { type: 'attack' as const, value: 9 + sector * 3, label: `Plasma Barrage (${9 + sector * 3} DMG)` },
      { type: 'attack' as const, value: 14 + sector * 2, label: `Heavy Penetrator (${14 + sector * 2} DMG)` },
      { type: 'defend' as const, value: 10 + sector * 2, label: `Firewall Reinforce (+${10 + sector * 2} Shield)` }
    ];
    const nextIntent = nextAttacks[Math.floor(Math.random() * nextAttacks.length)];

    setEnemy(prev => ({
      ...prev,
      shield: 0, // enemy shield resets each turn
      intent: nextIntent
    }));

    // Start player turn
    setEnergy(maxEnergy);
    setPlayerShield(0); // player shield resets
    drawCards(4);
    setTurn('PLAYER');
  };

  const handleSectorVictory = () => {
    soundEngine.playVictory();
    const finalScore = score + 1200 * sector;
    setScore(finalScore);
    setStatus('VICTORY');
    if (onVictory) onVictory(finalScore);
  };

  const nextSector = () => {
    soundEngine.playUiClick();
    const nextSec = sector + 1;
    setSector(nextSec);
    setEnemy({
      name: `Sector 0${nextSec} Overlord AI`,
      maxHp: 50 + nextSec * 25,
      hp: 50 + nextSec * 25,
      shield: 0,
      intent: { type: 'attack', value: 10 + nextSec * 2, label: `Laser Pulse (${10 + nextSec * 2} DMG)` }
    });
    setPlayerHp(Math.min(maxPlayerHp, playerHp + 15));
    setEnergy(3);
    setHand([]);
    setDiscardPile([]);
    // Add reward card to deck
    const rewardCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
    const newDeck = [...deck, rewardCard].sort(() => Math.random() - 0.5);
    setDeck(newDeck);
    drawCards(4, newDeck, []);
    setStatus('PLAYING');
    setTurn('PLAYER');
    addLog(`Breached Sector 0${nextSec}. Drafted [${rewardCard.name}] into deck.`);
  };

  const restartGame = () => {
    soundEngine.playUiClick();
    setSector(1);
    setPlayerHp(65);
    setPlayerShield(0);
    setEnergy(3);
    setScore(0);
    setDeck([...INITIAL_DECK]);
    setDiscardPile([]);
    setHand([]);
    setEnemy({
      name: 'Sector 01 Sub-Routine Bot',
      maxHp: 45,
      hp: 45,
      shield: 0,
      intent: { type: 'attack', value: 8, label: 'Attacking for 8 DMG' }
    });
    setStatus('PLAYING');
    setTurn('PLAYER');
    drawCards(4, [...INITIAL_DECK], []);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto select-none">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-t-xl px-5 py-3 text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 block">SECTOR</span>
            <span className="text-lg font-bold font-mono text-cyan-400">NODE 0{sector}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">SCORE</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">TURN</span>
            <span className={`text-xs font-bold font-mono ${turn === 'PLAYER' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {turn === 'PLAYER' ? 'YOUR INITIATIVE' : 'ENEMY CALCULATING...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span>DECK: {deck.length}</span>
          <span aria-hidden="true">·</span>
          <span>DISCARD: {discardPile.length}</span>
        </div>
      </div>

      {/* Main Tactical Card Arena */}
      <div className="relative w-full min-h-[540px] bg-[#070B14] border-x border-b border-slate-800 rounded-b-xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* TOP ZONE: Opponent AI Node */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 w-full max-w-md flex flex-col items-center shadow-lg">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="font-bold text-slate-200 text-sm">{enemy.name}</span>
              </div>
              {/* Intent Display */}
              <div className="flex items-center gap-1.5 text-xs font-mono bg-rose-950/60 border border-rose-800/60 text-rose-300 px-2.5 py-1 rounded">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>INTENT: {enemy.intent.label}</span>
              </div>
            </div>

            {/* Enemy HP & Shield Bar */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>HULL INTEGRITY</span>
                <span className="text-slate-200 tabular-nums">
                  {enemy.hp} / {enemy.maxHp} HP {enemy.shield > 0 && `(+${enemy.shield} SHIELD)`}
                </span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
                {enemy.shield > 0 && (
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (enemy.shield / enemy.maxHp) * 100)}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER ZONE: Tactical Field & Combat Logs */}
        <div className="relative z-10 my-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs font-mono text-slate-400 space-y-1 max-h-24 overflow-y-auto">
            {battleLog.map((log, idx) => (
              <div key={idx} className={idx === 0 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ZONE: Player Status & Interactive Hand */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Player Vitals & Energy */}
          <div className="w-full max-w-xl flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              {/* Energy Orb */}
              <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-800/80 px-3 py-1.5 rounded-lg shadow-cyan-950/50">
                <Zap className="w-4 h-4 text-cyan-400 fill-current" />
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  {energy} / {maxEnergy} ENERGY
                </span>
              </div>

              {/* Health & Shield */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-300">
                  HP: <strong className="text-emerald-400">{playerHp}</strong>/{maxPlayerHp}
                </span>
                {playerShield > 0 && (
                  <span className="text-blue-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 fill-current" />
                    +{playerShield}
                  </span>
                )}
              </div>
            </div>

            {/* End Turn Button */}
            <button
              onClick={endTurn}
              disabled={turn !== 'PLAYER' || status !== 'PLAYING'}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${turn === 'ENEMY' ? 'animate-spin' : ''}`} />
              END TURN
            </button>
          </div>

          {/* Cards In Hand */}
          <div className="flex items-center justify-center gap-3 w-full flex-wrap min-h-[170px]">
            {hand.map((card, idx) => {
              const canAfford = energy >= card.cost && turn === 'PLAYER' && status === 'PLAYING';
              return (
                <div
                  key={`${card.id}-${idx}`}
                  onClick={() => canAfford && playCard(card)}
                  className={`w-36 h-48 bg-slate-900 border-2 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none shadow-xl ${
                    card.glowColor
                  } ${
                    canAfford
                      ? 'hover:-translate-y-2 hover:shadow-cyan-500/20 active:scale-95'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-white leading-tight">{card.name}</span>
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                      {card.cost}
                    </span>
                  </div>

                  <div className="my-auto py-2 text-center">
                    {card.type === 'attack' && <Swords className="w-6 h-6 text-rose-400 mx-auto mb-1" />}
                    {card.type === 'defense' && <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1" />}
                    {card.type === 'power' && <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1" />}
                    {card.type === 'special' && <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-1" />}
                    <span className="text-[10px] text-slate-400 line-clamp-3 leading-tight block">
                      {card.description}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center border-t border-slate-800 pt-1">
                    {card.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTOR VICTORY OVERLAY */}
        {status === 'VICTORY' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <Trophy className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-3xl font-bold text-white mb-1">MAINFRAME BREACHED</h3>
            <p className="text-slate-400 text-sm mb-6">Sector 0{sector} Node purged successfully!</p>
            <div className="flex gap-4">
              <button
                onClick={nextSector}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm cursor-pointer"
              >
                PROCEED TO SECTOR 0{sector + 1}
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

        {/* GAME OVER OVERLAY */}
        {status === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-bold text-rose-500 mb-1">INTRUSION TERMINATED</h3>
            <p className="text-slate-400 text-sm mb-6">Your deck was neutralized by the security firewall.</p>
            <div className="flex gap-4">
              <button
                onClick={restartGame}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                TRY AGAIN
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-sm cursor-pointer"
                >
                  EXIT TO HUB
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between text-xs text-slate-500 px-2 py-3">
        <span>Click card in hand to execute program · Monitor upcoming enemy attack intent</span>
        <span>Roguelike Card Combat System</span>
      </div>
    </div>
  );
};
