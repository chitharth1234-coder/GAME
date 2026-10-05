export type GameId = 'void-runner' | 'neon-deck' | 'quantum-core';

export type GameCategory = 'all' | 'space-action' | 'tactical-deck' | 'arcade-puzzle';

export interface GameItem {
  id: GameId;
  title: string;
  tagline: string;
  genre: string;
  category: 'space-action' | 'tactical-deck' | 'arcade-puzzle';
  description: string;
  coverImage: string;
  rating: number;
  playCount: number;
  difficulty: 'Casual' | 'Tactical' | 'Hardcore';
  controls: { key: string; action: string }[];
  features: string[];
  maxHighscore: number;
  releaseDate: string;
  badge?: string;
}

export interface Achievement {
  id: string;
  gameId: GameId | 'global';
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  iconName: string;
}

export interface Quest {
  id: string;
  title: string;
  gameTitle: string;
  requirement: string;
  rewardXp: number;
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  gameId: GameId;
  badge: string;
  timeAgo: string;
}

export interface Tournament {
  id: string;
  title: string;
  gameTitle: string;
  gameId: GameId;
  prizePool: string;
  registeredCount: number;
  maxParticipants: number;
  endsIn: string;
  entryFee: string;
  status: 'Registration Open' | 'In Progress' | 'Concluded';
  isRegistered?: boolean;
}

export interface UserProfile {
  username: string;
  gamerTag: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  gamesPlayed: number;
  highScores: Record<GameId, number>;
  unlockedAchievements: string[];
}

export interface NewsPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  likes: number;
}
