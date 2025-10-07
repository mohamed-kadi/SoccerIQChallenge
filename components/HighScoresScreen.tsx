import React, { useState, useEffect } from 'react';
import { getHighScores } from '../services/storageService';
import { ScoreEntry, Difficulty } from '../types';

interface HighScoresScreenProps {
  onBack: () => void;
}

export const HighScoresScreen: React.FC<HighScoresScreenProps> = ({ onBack }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

  useEffect(() => {
    setScores(getHighScores(difficulty));
  }, [difficulty]);

  const difficultyLevels: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full">
      <h2 className="text-3xl font-bold mb-4 text-center">High Scores</h2>
      
      <div className="flex justify-center mb-4 border-b-2 border-gray-300 dark:border-gray-600">
        {difficultyLevels.map(level => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 ${
              difficulty === level
                ? 'border-b-4 border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <ol className="list-decimal list-inside space-y-2">
        {scores.length > 0 ? (
          scores.map((entry, index) => (
            <li key={`${entry.date}-${index}`} className="flex justify-between items-center p-2 rounded bg-gray-100 dark:bg-gray-700">
              <span className="font-bold text-lg">{index + 1}. {entry.initials}</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">{entry.score} pts</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No scores yet for this difficulty. Be the first!</p>
        )}
      </ol>

      <button
        onClick={onBack}
        className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105"
      >
        Back to Menu
      </button>
    </div>
  );
};
