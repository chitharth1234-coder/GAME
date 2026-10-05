/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GAMES_CATALOG,
  INITIAL_ACHIEVEMENTS,
  INITIAL_QUESTS,
  INITIAL_LEADERBOARD,
  INITIAL_TOURNAMENTS,
  GAMING_NEWS
} from './data/games';
import { GameItem, UserProfile, LeaderboardEntry, Tournament, Quest, Achievement } from './types';
import { TopBar } from './components/layout/TopBar';
import { HeroSection } from './components/home/HeroSection';
import { GameLibrary } from './components/home/GameLibrary';
import { GameModal } from './components/games/GameModal';
import { TournamentsSection } from './components/tournaments/TournamentsSection';
import { LeaderboardSection } from './components/leaderboard/LeaderboardSection';
import { QuestsSection } from './components/profile/QuestsSection';
import { NewsSection } from './components/news/NewsSection';
import { ProfileDrawer } from './components/profile/ProfileDrawer';
import { Footer } from './components/layout/Footer';
import { soundEngine } from './utils/audio';

const STORAGE_KEYS = {
  PROFILE: 'vortex_user_profile',
  TOURNAMENTS: 'vortex_tournaments',
  QUESTS: 'vortex_quests',
  ACHIEVEMENTS: 'vortex_achievements'
};

const DEFAULT_PROFILE: UserProfile = {
  username: 'ApexPilot',
  gamerTag: 'Valkyrie_9',
  avatar: '🚀',
  level: 4,
  xp: 750,
  xpToNextLevel: 1000,
  title: 'Orbital Interceptor Ace',
  gamesPlayed: 24,
  highScores: {
    'void-runner': 14250,
    'neon-deck': 8600,
    'quantum-core': 21100
  },
  unlockedAchievements: ['ach-first-blood', 'ach-deck-master']
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('games');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEngine.enabled);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Tournaments State
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  });

  // Quests State
  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTS;
    } catch {
      return INITIAL_QUESTS;
    }
  });

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleSound = () => {
    const active = soundEngine.toggleSound();
    setSoundEnabled(active);
    showToast(active ? 'Procedural Sound Synthesizer Enabled' : 'Game Sound Muted');
  };

  const handleUpdateProfile = (partial: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...partial }));
    showToast('Callsign and Profile Updated');
  };

  const handleGameScoreUpdate = (gameId: string, score: number) => {
    setUserProfile(prev => {
      const currentBest = prev.highScores[gameId as keyof typeof prev.highScores] || 0;
      if (score > currentBest) {
        showToast(`New Personal Best for ${gameId}: ${score.toLocaleString()} PTS!`);
        return {
          ...prev,
          highScores: {
            ...prev.highScores,
            [gameId]: score
          }
        };
      }
      return prev;
    });

    // Award XP based on game performance
    addXp(Math.max(50, Math.round(score / 50)));
  };

  const addXp = (amount: number) => {
    setUserProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let nextLevelXp = prev.xpToNextLevel;

      while (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
        nextLevelXp = Math.round(nextLevelXp * 1.35);
        soundEngine.playVictory();
        showToast(`PROMOTED! You reached Level ${newLevel} Vanguard!`);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: nextLevelXp
      };
    });
  };

  const handleClaimQuest = (questId: string) => {
    setQuests(prev =>
      prev.map(q => {
        if (q.id === questId && q.completed && !q.claimed) {
          addXp(q.rewardXp);
          showToast(`Claimed +${q.rewardXp} XP from ${q.title}!`);
          return { ...q, claimed: true };
        }
        return q;
      })
    );
  };

  const handleRegisterTournament = (tourneyId: string) => {
    setTournaments(prev =>
      prev.map(t => {
        if (t.id === tourneyId) {
          const nextRegistered = !t.isRegistered;
          soundEngine.playVictory();
          showToast(
            nextRegistered
              ? `Enrolled in ${t.title}! Good luck in qualifiers!`
              : `Withdrawn from ${t.title}`
          );
          return {
            ...t,
            isRegistered: nextRegistered,
            registeredCount: nextRegistered ? t.registeredCount + 1 : t.registeredCount - 1
          };
        }
        return t;
      })
    );
  };

  const handlePlayGameById = (gameId: string) => {
    const game = GAMES_CATALOG.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Bar Navigation */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onPlayFeaturedGame={() => setSelectedGame(GAMES_CATALOG[0])}
          onExploreGames={() => {
            const el = document.getElementById('games');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Tab 1: Games Library */}
        <div className={activeTab === 'games' ? 'block' : 'hidden'}>
          <GameLibrary
            games={GAMES_CATALOG}
            onSelectGame={setSelectedGame}
            onViewDetails={setSelectedGame}
            userHighScores={userProfile.highScores}
          />
        </div>

        {/* Tab 2: Tournaments */}
        <div className={activeTab === 'tournaments' ? 'block' : 'hidden'}>
          <TournamentsSection
            tournaments={tournaments}
            onRegister={handleRegisterTournament}
            onPlayGame={handlePlayGameById}
          />
        </div>

        {/* Tab 3: Leaderboards */}
        <div className={activeTab === 'leaderboards' ? 'block' : 'hidden'}>
          <LeaderboardSection
            entries={INITIAL_LEADERBOARD}
            userScore={userProfile.highScores}
            userTag={userProfile.gamerTag}
          />
        </div>

        {/* Tab 4: Quests & Progression */}
        <div className={activeTab === 'quests' ? 'block' : 'hidden'}>
          <QuestsSection
            quests={quests}
            achievements={achievements}
            onClaimQuest={handleClaimQuest}
          />
        </div>

        {/* Tab 5: News & Patch Notes */}
        <div className={activeTab === 'news' ? 'block' : 'hidden'}>
          <NewsSection articles={GAMING_NEWS} />
        </div>
      </main>

      {/* Interactive Game Theater Modal */}
      <GameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onGameScoreUpdate={handleGameScoreUpdate}
        achievements={achievements}
      />

      {/* Profile Dossier Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        games={GAMES_CATALOG}
      />

      {/* System Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Platform Footer */}
      <Footer onSelectTab={setActiveTab} />
    </div>
  );
}
