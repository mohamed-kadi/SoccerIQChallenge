import { ScoreEntry, GameStats, Difficulty, Achievement } from '../types';
import { ACHIEVEMENTS } from '../constants';

const HIGH_SCORES_KEY_PREFIX = 'soccerTriviaHighScores_';
const STATS_KEY = 'soccerTriviaStats';
const THEME_KEY = 'soccerTriviaTheme';
const SOUND_KEY = 'soccerTriviaSoundMuted';
const ACHIEVEMENTS_KEY = 'soccerTriviaAchievements';

// High Scores
const getHighScoresKey = (difficulty: Difficulty) => `${HIGH_SCORES_KEY_PREFIX}${difficulty}`;

export const getHighScores = (difficulty: Difficulty): ScoreEntry[] => {
  try {
    const scores = localStorage.getItem(getHighScoresKey(difficulty));
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error(`Error getting high scores for ${difficulty}:`, error);
    return [];
  }
};

export const saveHighScore = (newScore: Omit<ScoreEntry, 'date'>, difficulty: Difficulty): void => {
  try {
    const scores = getHighScores(difficulty);
    const scoreWithDate: ScoreEntry = { ...newScore, date: new Date().toISOString() };
    scores.push(scoreWithDate);
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(getHighScoresKey(difficulty), JSON.stringify(scores.slice(0, 10))); // Keep top 10
  } catch (error) {
    console.error(`Error saving high score for ${difficulty}:`, error);
  }
};

export const isHighScore = (score: number, difficulty: Difficulty): boolean => {
  if (score <= 0) return false;
  const scores = getHighScores(difficulty);
  return scores.length < 10 || score > scores[scores.length - 1].score;
};


// Stats
export const getStats = (): GameStats => {
  try {
    const stats = localStorage.getItem(STATS_KEY);
    return stats ? JSON.parse(stats) : {
      gamesPlayed: 0,
      totalScore: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      fastestAnswer: Infinity,
      perfectGames: 0
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { gamesPlayed: 0, totalScore: 0, questionsAnswered: 0, correctAnswers: 0, fastestAnswer: Infinity, perfectGames: 0 };
  }
};

export const saveStats = (statsUpdate: Partial<GameStats>): void => {
  try {
    const currentStats = getStats();
    const newStats: GameStats = {
      gamesPlayed: currentStats.gamesPlayed + (statsUpdate.gamesPlayed || 0),
      totalScore: currentStats.totalScore + (statsUpdate.totalScore || 0),
      questionsAnswered: currentStats.questionsAnswered + (statsUpdate.questionsAnswered || 0),
      correctAnswers: currentStats.correctAnswers + (statsUpdate.correctAnswers || 0),
      fastestAnswer: Math.min(currentStats.fastestAnswer, statsUpdate.fastestAnswer || Infinity),
      perfectGames: currentStats.perfectGames + (statsUpdate.perfectGames || 0),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  } catch (error)
 {
    console.error('Error saving stats:', error);
  }
};

export const clearStats = (): void => {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  } catch (error) {
    console.error('Error clearing stats:', error);
  }
};

// Achievements
export const getAchievements = (): string[] => {
  try {
    const unlocked = localStorage.getItem(ACHIEVEMENTS_KEY);
    return unlocked ? JSON.parse(unlocked) : [];
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

export const saveAchievements = (unlockedIds: string[]): void => {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedIds));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};


// Theme
export const getTheme = (): 'light' | 'dark' => {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error setting theme:', error);
  }
};

// Sound
export const getSoundMuted = (): boolean => {
  try {
    return localStorage.getItem(SOUND_KEY) === 'true';
  } catch (error) {
    return false;
  }
};

export const setSoundMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(SOUND_KEY, String(muted));
  } catch (error) {
    console.error('Error setting sound mute state:', error);
  }
};
