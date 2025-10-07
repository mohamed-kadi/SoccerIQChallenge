import React, { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isPaused: boolean;
}

const STROKE_WIDTH = 8;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 0.1);
    }, 100);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp, isPaused]);

  const progress = (timeLeft / duration) * CIRCUMFERENCE;
  const strokeColor = timeLeft > duration * 0.5 ? 'stroke-green-500' : timeLeft > duration * 0.2 ? 'stroke-yellow-500' : 'stroke-red-500';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        {/* Background Circle */}
        <circle
          className="text-gray-300 dark:text-gray-600"
          strokeWidth={STROKE_WIDTH}
          stroke="currentColor"
          fill="transparent"
          r={RADIUS}
          cx="60"
          cy="60"
        />
        {/* Progress Circle */}
        <circle
          className={`transform -rotate-90 origin-center transition-all duration-100 ${strokeColor}`}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - progress}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={RADIUS}
          cx="60"
          cy="60"
        />
      </svg>
      <span className="absolute text-xl font-bold text-gray-800 dark:text-gray-200">
        {Math.ceil(timeLeft)}
      </span>
    </div>
  );
};
