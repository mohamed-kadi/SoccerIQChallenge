import React, { useState } from 'react';
import { Difficulty } from '../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  onShowHighScores: () => void;
  onShowStats: () => void;
  error: string | null;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowHighScores, onShowStats, error }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

  const handleStart = () => {
    onStart(difficulty);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold mb-6">Welcome!</h2>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
        Test your sports knowledge.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full" role="alert">
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-8 w-full">
        <label htmlFor="difficulty" className="block text-lg font-medium mb-2">
          Choose Difficulty:
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {error ? (
        <button
          onClick={handleStart}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Retry
        </button>
      ) : (
        <button
          onClick={handleStart}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Start Quiz
        </button>
      )}

      <div className="mt-6 flex space-x-4">
        <button
          onClick={onShowHighScores}
          className="text-yellow-600 dark:text-yellow-400 hover:underline"
        >
          High Scores
        </button>
        <button
          onClick={onShowStats}
          className="text-yellow-600 dark:text-yellow-400 hover:underline"
        >
          View Stats
        </button>
      </div>
    </div>
  );
};