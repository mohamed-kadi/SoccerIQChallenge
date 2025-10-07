import React, { useState, useEffect } from 'react';
import { getStats, clearStats, getAchievements } from '../services/storageService';
import { GameStats } from '../types';
import { ACHIEVEMENTS } from '../constants';

interface StatsScreenProps {
  onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    setStats(getStats());
    setUnlockedAchievements(getAchievements());
  }, []);
  
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all your stats and achievements? This action cannot be undone.")) {
      clearStats();
      setStats(getStats()); // re-fetch to show initial state
      setUnlockedAchievements([]);
    }
  };

  const accuracy = stats && stats.questionsAnswered > 0
    ? ((stats.correctAnswers / stats.questionsAnswered) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">Stats & Achievements</h2>
      
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Games Played</p>
            <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
            <p className="text-2xl font-bold">{accuracy}%</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Score</p>
            <p className="text-2xl font-bold">{stats.totalScore}</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Perfect Games</p>
            <p className="text-2xl font-bold">{stats.perfectGames}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold mb-4">Achievements</h3>
        <div className="space-y-3">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <div key={ach.id} className={`p-3 rounded-lg flex items-center transition-opacity ${isUnlocked ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-gray-100 dark:bg-gray-700 opacity-60'}`}>
                <span className="text-3xl mr-4">{ach.icon}</span>
                <div>
                  <p className="font-bold">{ach.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center">
        <button
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Back to Menu
        </button>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          Reset Stats
        </button>
      </div>
    </div>
  );
};
