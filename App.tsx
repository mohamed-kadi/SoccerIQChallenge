import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { QuestionCard } from './components/QuestionCard';
import { ScoreScreen } from './components/ScoreScreen';
import { Loader } from './components/Loader';
import { ThemeToggler } from './components/ThemeToggler';
import { SoundToggler } from './components/SoundToggler';
import { HighScoresScreen } from './components/HighScoresScreen';
import { StatsScreen } from './components/StatsScreen';
import { fetchTriviaQuestions } from './services/geminiService';
import { getTheme, setTheme as saveTheme, saveStats, getStats, getAchievements, saveAchievements } from './services/storageService';
import { QuestionState, Difficulty, Achievement } from './types';
import { TOTAL_QUESTIONS, ACHIEVEMENTS, TIMER_DURATION } from './constants';
import { playSound, isMuted, toggleMute, initAudioOnInteraction } from './services/soundService';

type GameState = 'start' | 'loading' | 'active' | 'score' | 'highscores' | 'stats';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme());
  const [soundMuted, setSoundMuted] = useState(isMuted());
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [maxCorrectStreak, setMaxCorrectStreak] = useState(0);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const handleFirstInteraction = () => {
    initAudioOnInteraction();
  };

  const toggleTheme = () => {
    handleFirstInteraction();
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    playSound('click');
  };

  const handleToggleMute = () => {
    handleFirstInteraction();
    toggleMute();
    setSoundMuted(isMuted());
  };

  const startQuiz = async (selectedDifficulty: Difficulty) => {
    handleFirstInteraction();
    playSound('click');
    setLoading(true);
    setGameState('loading');
    setError(null);
    setDifficulty(selectedDifficulty);
    setNewlyUnlockedAchievements([]);
    setCorrectStreak(0);
    setMaxCorrectStreak(0);
    try {
      const newQuestions = await fetchTriviaQuestions(selectedDifficulty);
      setQuestions(newQuestions.map(q => ({ ...q, userAnswer: undefined, timeTaken: 0 })));
      setScore(0);
      setCurrentQuestionIndex(0);
      setGameState('active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGameState('start');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string, timeTaken: number) => {
    const isCorrect = questions[currentQuestionIndex].correctAnswer === answer;
    let points = 0;
    if (isCorrect) {
      // Bonus points for speed
      points = 100 + Math.max(0, (TIMER_DURATION - Math.floor(timeTaken)) * 10);
      setScore(prev => prev + points);
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setMaxCorrectStreak(prevMax => Math.max(prevMax, newStreak));
      playSound('correct');
    } else {
      setCorrectStreak(0);
      playSound('incorrect');
    }

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        userAnswer: answer,
        timeTaken,
    };
    setQuestions(updatedQuestions);

    setTimeout(() => {
      const nextQuestion = currentQuestionIndex + 1;
      if (nextQuestion < TOTAL_QUESTIONS) {
        setCurrentQuestionIndex(nextQuestion);
      } else {
        // Correctly calculate and pass the final total score to endGame.
        const finalScore = score + points;
        endGame(updatedQuestions, finalScore);
      }
    }, 1000);
  };
  
  const endGame = (finalQuestions: QuestionState[], finalScore: number) => {
      const correctAnswers = finalQuestions.filter(q => q.correctAnswer === q.userAnswer).length;
      const totalTime = finalQuestions.reduce((acc, q) => acc + (q.timeTaken || 0), 0);
      const avgTime = totalTime > 0 ? totalTime / TOTAL_QUESTIONS : Infinity;

      const statsUpdate = {
          gamesPlayed: 1,
          totalScore: finalScore,
          questionsAnswered: TOTAL_QUESTIONS,
          correctAnswers: correctAnswers,
          fastestAnswer: avgTime,
          perfectGames: correctAnswers === TOTAL_QUESTIONS ? 1 : 0,
      };
      saveStats(statsUpdate);
      checkAchievements(finalScore, correctAnswers, maxCorrectStreak);
      setGameState('score');
  }

  const checkAchievements = (finalScore: number, correctAnswers: number, maxStreak: number) => {
    const currentStats = getStats();
    const unlockedAchievements = getAchievements();
    const newAchievements: Achievement[] = [];

    const sessionData = { 
        score: finalScore, 
        totalQuestions: TOTAL_QUESTIONS,
        difficulty: difficulty,
        correctAnswers: correctAnswers,
        maxCorrectStreak: maxStreak,
    };

    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id)) {
        if (achievement.isUnlocked(currentStats, sessionData)) {
          newAchievements.push(achievement);
          unlockedAchievements.push(achievement.id);
        }
      }
    });

    if (newAchievements.length > 0) {
      saveAchievements(unlockedAchievements);
      setNewlyUnlockedAchievements(newAchievements);
    }
  };


  const restartQuiz = () => {
    playSound('click');
    setGameState('start');
    setQuestions([]);
  };
  
  const showHighScores = () => {
    playSound('click');
    setGameState('highscores');
  };
  const showStats = () => {
    playSound('click');
    setGameState('stats');
  };
  const backToStart = () => {
    playSound('click');
    setGameState('start');
  };

  const renderContent = () => {
    switch (gameState) {
      case 'loading':
        return <Loader />;
      case 'active':
        return (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={TOTAL_QUESTIONS}
            onAnswer={handleAnswer}
          />
        );
      case 'score':
        return (
          <ScoreScreen
            score={score}
            onRestart={restartQuiz}
            difficulty={difficulty}
            unlockedAchievements={newlyUnlockedAchievements}
          />
        );
      case 'highscores':
        return <HighScoresScreen onBack={backToStart} />;
      case 'stats':
        return <StatsScreen onBack={backToStart} />;
      case 'start':
      default:
        return (
          <StartScreen
            onStart={startQuiz}
            onShowHighScores={showHighScores}
            onShowStats={showStats}
            error={error}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500">
      <div className="absolute top-4 right-4 flex space-x-2">
        <SoundToggler muted={soundMuted} onToggle={handleToggleMute} />
        <ThemeToggler theme={theme} onToggle={toggleTheme} />
      </div>
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 dark:text-yellow-400 mb-4 font-mono">
          Sports IQ Challenge
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
