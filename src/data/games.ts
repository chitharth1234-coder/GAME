import { GameItem, Achievement, Quest, LeaderboardEntry, Tournament, NewsPost } from '../types';

export const HERO_BANNER_IMAGE = '/src/assets/images/gaming_hero_cyberpunk_1791194889086.jpg';

export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'void-runner',
    title: 'Cyber Strike: Void Runner',
    tagline: 'High-velocity space combat and asteroid field survival',
    genre: 'Retro Space Shooter',
    category: 'space-action',
    description: 'Pilot an experimental combat interceptor through dense hostile asteroid belts and swarms of autonomous defense drones. Collect plasma weapon upgrades, maintain kinetic shields, and annihilate rogue dreadnoughts.',
    coverImage: '/src/assets/images/game_cover_void_runner_1791194904009.jpg',
    rating: 4.9,
    playCount: 18420,
    difficulty: 'Hardcore',
    controls: [
      { key: 'W / ↑ or Mouse', action: 'Pitch Up' },
      { key: 'S / ↓ or Mouse', action: 'Pitch Down' },
      { key: 'A / ←', action: 'Bank Left' },
      { key: 'D / →', action: 'Bank Right' },
      { key: 'Spacebar / Left Click', action: 'Fire Plasma Blasters' },
      { key: 'Shift / Double Click', action: 'Activate Kinetic Shield' },
      { key: 'P / Esc', action: 'Pause Mission' }
    ],
    features: [
      '60 FPS dynamic particle starfield and collision engine',
      '5 distinct weapon tiers including Triple Cannons and Overcharge Lasers',
      'Modular boss encounters with destructible armor hardpoints',
      'Real-time Web Audio synthesized retro combat soundscape'
    ],
    maxHighscore: 14250,
    releaseDate: 'October 2026'
  },
  {
    id: 'neon-deck',
    title: 'Neon Deck: Rogue Ascent',
    tagline: 'Cyberpunk tactical roguelike deckbuilder against rogue AI',
    genre: 'Roguelike Deckbuilder',
    category: 'tactical-deck',
    description: 'Infiltrate the megalith megacorp mainframe by drafting cybernetic combat programs, nanite energy shields, and malware exploits. Anticipate hostile AI attack intents and execute lethal card combinations.',
    coverImage: '/src/assets/images/game_cover_neon_deck_1791194915224.jpg',
    rating: 4.8,
    playCount: 12940,
    difficulty: 'Tactical',
    controls: [
      { key: 'Click & Select Card', action: 'Inspect and prepare program' },
      { key: 'Target Node / Double Click', action: 'Execute card against target' },
      { key: 'End Turn Button', action: 'Pass initiative to enemy AI' },
      { key: 'Deck / Discard Pile', action: 'Review draw probability' }
    ],
    features: [
      'Strategic 3-energy per turn tactical system with full draw/discard loop',
      'Enemy intent previews showing exact upcoming damage and defenses',
      'Draft new cards into your deck after every successful sector breach',
      'Dynamic status effects: Overclock, Nanite Shield, EMP Stun'
    ],
    maxHighscore: 8600,
    releaseDate: 'September 2026'
  },
  {
    id: 'quantum-core',
    title: 'Gridlock: Quantum Core',
    tagline: 'Resonant chain reaction puzzle with energetic core collapses',
    genre: 'Arcade Grid Puzzle',
    category: 'arcade-puzzle',
    description: 'Manipulate unstable subatomic quantum cells on an 8x8 particle lattice. Connect resonant plasma, photon, dark matter, and tachyon clusters to spark cascading collapses and charge the ultimate Hyper-Core.',
    coverImage: '/src/assets/images/game_cover_quantum_core_1791194928000.jpg',
    rating: 4.7,
    playCount: 15300,
    difficulty: 'Casual',
    controls: [
      { key: 'Click & Drag', action: 'Link adjacent matching quantum cells' },
      { key: 'Double Click Core', action: 'Detonate charged Hyper-Core' },
      { key: 'R Key', action: 'Scramble lattice (costs 100 energy)' }
    ],
    features: [
      'Satisfying chain linkage mechanic with real-time harmonic chimes',
      'Combo multipliers for extended chain connections (4+ to 10+ cells)',
      'Subatomic particle burst effects with smooth 60fps canvas sparks',
      'Two game modes: 60-Second Blitz Rush and Strategic Move Challenge'
    ],
    maxHighscore: 29400,
    releaseDate: 'August 2026'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-blood',
    gameId: 'void-runner',
    title: 'Starfighter Ace',
    description: 'Destroy 10 enemy interceptor drones in a single Void Runner run.',
    xpReward: 250,
    unlocked: true,
    iconName: 'Crosshair'
  },
  {
    id: 'ach-void-boss',
    gameId: 'void-runner',
    title: 'Dreadnought Breaker',
    description: 'Survive until Wave 3 and defeat the autonomous Mega Dreadnought.',
    xpReward: 500,
    unlocked: false,
    iconName: 'ShieldAlert'
  },
  {
    id: 'ach-deck-master',
    gameId: 'neon-deck',
    title: 'Overclocked Architect',
    description: 'Play 4 cards in a single combat turn in Neon Deck.',
    xpReward: 300,
    unlocked: true,
    iconName: 'Cpu'
  },
  {
    id: 'ach-deck-victory',
    gameId: 'neon-deck',
    title: 'Mainframe Purge',
    description: 'Defeat the Sub-Core AI without taking direct hull damage.',
    xpReward: 600,
    unlocked: false,
    iconName: 'Zap'
  },
  {
    id: 'ach-quantum-combo',
    gameId: 'quantum-core',
    title: 'Quantum Resonance',
    description: 'Execute a 6-cell chain reaction in Gridlock: Quantum Core.',
    xpReward: 350,
    unlocked: false,
    iconName: 'Boxes'
  },
  {
    id: 'ach-all-rounder',
    gameId: 'global',
    title: 'Vortex Vanguard',
    description: 'Play all 3 featured interactive arcade games on the platform.',
    xpReward: 400,
    unlocked: false,
    iconName: 'Trophy'
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Combat Readiness',
    gameTitle: 'Void Runner',
    requirement: 'Eliminate 15 hostile drones',
    rewardXp: 180,
    current: 8,
    target: 15,
    completed: false,
    claimed: false
  },
  {
    id: 'quest-2',
    title: 'Firewall Breach',
    gameTitle: 'Neon Deck',
    requirement: 'Deal 50 total damage with attack programs',
    rewardXp: 220,
    current: 50,
    target: 50,
    completed: true,
    claimed: false
  },
  {
    id: 'quest-3',
    title: 'Resonance Protocol',
    gameTitle: 'Quantum Core',
    requirement: 'Score 5,000 points in Quantum Core',
    rewardXp: 200,
    current: 3400,
    target: 5000,
    completed: false,
    claimed: false
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'K4g3_Ghost', avatar: '⚡', score: 18450, gameId: 'void-runner', badge: 'Apex Pilot', timeAgo: '12m ago' },
  { rank: 2, username: 'Valkyrie_9', avatar: '🚀', score: 16900, gameId: 'void-runner', badge: 'Grandmaster', timeAgo: '45m ago' },
  { rank: 3, username: 'Zero_Latency', avatar: '🎯', score: 14250, gameId: 'void-runner', badge: 'Diamond', timeAgo: '2h ago' },
  { rank: 4, username: 'Neon_Samurai', avatar: '🗡️', score: 12100, gameId: 'void-runner', badge: 'Gold I', timeAgo: '4h ago' },
  { rank: 5, username: 'Rogue_Echo', avatar: '🛰️', score: 9850, gameId: 'void-runner', badge: 'Silver', timeAgo: '6h ago' },

  { rank: 1, username: 'Cipher_Warden', avatar: '🃏', score: 11200, gameId: 'neon-deck', badge: 'Deck Architect', timeAgo: '22m ago' },
  { rank: 2, username: 'Null_Pointer', avatar: '💻', score: 9800, gameId: 'neon-deck', badge: 'Grandmaster', timeAgo: '1h ago' },
  { rank: 3, username: 'Bit_Crusher', avatar: '👾', score: 8600, gameId: 'neon-deck', badge: 'Diamond', timeAgo: '3h ago' },
  { rank: 4, username: 'K4g3_Ghost', avatar: '⚡', score: 7450, gameId: 'neon-deck', badge: 'Gold I', timeAgo: '5h ago' },

  { rank: 1, username: 'Prism_Solver', avatar: '💎', score: 34500, gameId: 'quantum-core', badge: 'Quantum Sage', timeAgo: '15m ago' },
  { rank: 2, username: 'Flux_Capacitor', avatar: '🌀', score: 29400, gameId: 'quantum-core', badge: 'Grandmaster', timeAgo: '1h ago' },
  { rank: 3, username: 'Nova_Chain', avatar: '✨', score: 24800, gameId: 'quantum-core', badge: 'Diamond', timeAgo: '4h ago' },
  { rank: 4, username: 'Valkyrie_9', avatar: '🚀', score: 21100, gameId: 'quantum-core', badge: 'Gold I', timeAgo: '8h ago' }
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourney-void-championship',
    title: 'Interstellar Void Circuit 2026',
    gameTitle: 'Cyber Strike: Void Runner',
    gameId: 'void-runner',
    prizePool: '$8,500 USDC',
    registeredCount: 412,
    maxParticipants: 512,
    endsIn: '2d 14h',
    entryFee: 'Free Entry',
    status: 'Registration Open',
    isRegistered: false
  },
  {
    id: 'tourney-deck-clash',
    title: 'Mainframe Infiltration Invitational',
    gameTitle: 'Neon Deck: Rogue Ascent',
    gameId: 'neon-deck',
    prizePool: '$4,000 USDC',
    registeredCount: 128,
    maxParticipants: 128,
    endsIn: '6h 32m',
    entryFee: 'Free Entry',
    status: 'In Progress',
    isRegistered: true
  },
  {
    id: 'tourney-quantum-blitz',
    title: 'Quantum Resonance Blitz Cup',
    gameTitle: 'Gridlock: Quantum Core',
    gameId: 'quantum-core',
    prizePool: '$2,500 USDC',
    registeredCount: 198,
    maxParticipants: 256,
    endsIn: '4d 10h',
    entryFee: 'Free Entry',
    status: 'Registration Open',
    isRegistered: false
  }
];

export const GAMING_NEWS: NewsPost[] = [
  {
    id: 'news-1',
    title: 'Void Runner Patch 2.4: Dreadnought Armor Physics & Pulse Lasers',
    category: 'Patch Notes',
    date: 'October 3, 2026',
    readTime: '4 min read',
    author: 'Vortex Dev Team',
    excerpt: 'Explore the newly re-engineered collision matrix, enhanced sound synthesis, and the tactical EMP sub-weapon drop available across Sector 4 asteroid belts.',
    likes: 342
  },
  {
    id: 'news-2',
    title: 'World Championship Season 4 Announced: $30,000 Global Prize Pool',
    category: 'Esports',
    date: 'September 28, 2026',
    readTime: '6 min read',
    author: 'Competitive Operations',
    excerpt: 'Qualifiers kick off next Friday for all registered pilot squads. Top 16 pilots from Void Runner and Neon Deck will advance to the live streamed grand finals.',
    likes: 589
  },
  {
    id: 'news-3',
    title: 'Under the Hood: Procedural Web Audio in Next-Gen Browser Gaming',
    category: 'Engineering',
    date: 'September 20, 2026',
    readTime: '5 min read',
    author: 'Audio Engineering Lead',
    excerpt: 'How we eliminate latency and asset bloat by synthesizing custom oscillators, frequency modulation, and reactive biquad filters directly in client hardware.',
    likes: 275
  }
];
