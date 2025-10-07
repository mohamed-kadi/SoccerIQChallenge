export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuestionState extends Question {
  userAnswer?: string;
  timeTaken?: number;
}

export interface ScoreEntry {
  score: number;
  initials: string;
  date: string;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  fastestAnswer: number; // in seconds
  perfectGames: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or SVG path
  isUnlocked: (stats: GameStats, sessionData: { 
    score: number; 
    totalQuestions: number;
    difficulty: Difficulty;
    correctAnswers: number;
    maxCorrectStreak: number;
  }) => boolean;
}