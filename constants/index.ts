import { Achievement } from './types';

export const TOTAL_QUESTIONS = 10;
export const TIMER_DURATION = 15; // seconds per question

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'Newcomer',
    description: 'Play your first game of Sports IQ Challenge.',
    icon: '👋',
    isUnlocked: (stats) => stats.gamesPlayed >= 1,
  },
  {
    id: 'perfect_score',
    title: 'Perfectionist',
    description: 'Get a perfect score in any difficulty.',
    icon: '🎯',
    isUnlocked: (stats, session) => session.correctAnswers === session.totalQuestions,
  },
  {
    id: 'on_a_roll',
    title: 'On a Roll!',
    description: 'Answer 5 questions correctly in a row.',
    icon: '🚀',
    isUnlocked: (stats, session) => session.maxCorrectStreak >= 5,
  },
  {
    id: 'hard_mode_win',
    title: 'Hard Mode Hero',
    description: 'Finish a game on Hard with over 50% correct.',
    icon: '🔥',
    isUnlocked: (stats, session) => session.difficulty === 'Hard' && session.correctAnswers / session.totalQuestions > 0.5,
  },
  {
    id: 'know_it_all',
    title: 'Know-It-All',
    description: 'Answer 100 questions correctly in total.',
    icon: '🧠',
    isUnlocked: (stats) => stats.correctAnswers >= 100,
  },
  {
    id: 'veteran',
    title: 'Seasoned Veteran',
    description: 'Play 25 games.',
    icon: '🏅',
    isUnlocked: (stats) => stats.gamesPlayed >= 25,
  },
];
