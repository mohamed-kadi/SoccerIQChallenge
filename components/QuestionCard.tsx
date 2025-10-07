import React, { useState, useEffect, useRef } from 'react';
import { QuestionState } from '../types';
import { Timer } from './Timer';
import { TIMER_DURATION } from '../constants';

interface QuestionCardProps {
  question: QuestionState;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, timeTaken: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timerKey, setTimerKey] = useState(Date.now());
  const startTimeRef = useRef<number>(Date.now());


  useEffect(() => {
    setSelectedAnswer(null);
    setTimerKey(Date.now());
    startTimeRef.current = Date.now();
  }, [question]);

  const handleOptionClick = (option: string) => {
    if (selectedAnswer) return;
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    setSelectedAnswer(option);
    onAnswer(option, timeTaken);
  };

  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return 'bg-gray-200 dark:bg-gray-700 hover:bg-yellow-400 dark:hover:bg-yellow-600';
    }
    const isCorrect = option === question.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return 'bg-green-500 text-white animate-pulse';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-200 dark:bg-gray-700 opacity-60';
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">
          Question {questionNumber} / {totalQuestions}
        </p>
        <Timer
          key={timerKey}
          duration={TIMER_DURATION}
          onTimeUp={() => handleOptionClick('')} // Submit empty answer on time up
          isPaused={!!selectedAnswer}
        />
      </div>
      <h2
        className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            disabled={!!selectedAnswer}
            className={`w-full p-4 rounded-lg text-left transition-colors duration-300 font-medium ${getButtonClass(
              option
            )}`}
            dangerouslySetInnerHTML={{ __html: option }}
          />
        ))}
      </div>
    </div>
  );
};
