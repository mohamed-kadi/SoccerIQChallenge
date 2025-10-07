import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-t-4 border-t-yellow-500 dark:border-t-yellow-400 border-gray-300 dark:border-gray-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Generating your quiz...
      </p>
    </div>
  );
};
