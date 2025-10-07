import React, { useState, useEffect } from 'react';
import { saveHighScore, isHighScore } from '../services/storageService';
import { Difficulty, Achievement } from '../types';
import { playSound } from '../services/soundService';

interface ScoreScreenProps {
  score: number;
  onRestart: () => void;
  difficulty: Difficulty;
  unlockedAchievements: Achievement[];
}

export const ScoreScreen: React.FC<ScoreScreenProps> = ({ score, onRestart, difficulty, unlockedAchievements }) => {
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [initials, setInitials] = useState('');
  const [highScoreSaved, setHighScoreSaved] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const animationDuration = 1000; // 1 second
    let startTime: number;

    const animateScore = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const currentDisplayScore = Math.min(score, Math.floor((progress / animationDuration) * score));
      
      setAnimatedScore(currentDisplayScore);

      if (progress < animationDuration) {
        requestAnimationFrame(animateScore);
      } else {
        setAnimatedScore(score); // Ensure it ends exactly on the final score
      }
    };

    requestAnimationFrame(animateScore);
    
    // Check for high score right away
    if (isHighScore(score, difficulty)) {
      setIsNewHighScore(true);
      playSound('correct'); // Play a special sound for high score
    }

  }, [score, difficulty]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (initials.trim() && !highScoreSaved) {
      saveHighScore({ score, initials: initials.trim().toUpperCase() }, difficulty);
      setHighScoreSaved(true);
      playSound('click');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
      <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
      <p className="text-6xl font-extrabold text-yellow-500 dark:text-yellow-400 mb-4">
        {animatedScore}
      </p>

      {isNewHighScore && !highScoreSaved && (
        <form onSubmit={handleSaveScore} className="w-full flex flex-col items-center mb-4">
          <p className="text-xl font-semibold text-green-500 dark:text-green-400 animate-bounce">New High Score!</p>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.slice(0, 3))}
            maxLength={3}
            placeholder="Enter Initials (AAA)"
            className="mt-2 p-2 w-40 text-center bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button type="submit" className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Save Score
          </button>
        </form>
      )}
      
      {highScoreSaved && <p className="text-green-500 dark:text-green-400 mb-4">High Score Saved!</p>}
      
      {unlockedAchievements.length > 0 && (
        <div className="my-4 p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg w-full">
          <h3 className="text-xl font-bold mb-2 text-yellow-800 dark:text-yellow-300">Achievements Unlocked!</h3>
          {unlockedAchievements.map(ach => (
            <div key={ach.id} className="flex items-center">
              <span className="text-2xl mr-2">{ach.icon}</span>
              <span className="font-semibold">{ach.title}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 mt-4"
      >
        Play Again
      </button>
    </div>
  );
};