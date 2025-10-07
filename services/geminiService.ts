import { Question, Difficulty } from '../types';
import { TOTAL_QUESTIONS } from '../constants';

// Helper function to shuffle an array without mutating the original
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to decode base64 strings, which the OTDB API uses for encoding.
// This version is robust and handles UTF-8 characters correctly.
const decodeBase64 = (str: string): string => {
    try {
        // This function handles Base64 strings that might represent UTF-8 text.
        // 1. Decode base64 to a "binary" string (each character is a byte).
        const binaryString = atob(str);
        // 2. Convert the binary string to a byte array.
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // 3. Use TextDecoder to convert the byte array (assuming UTF-8) to a proper string.
        return new TextDecoder().decode(bytes);
    } catch (e) {
        console.error("Failed to decode base64 string:", str, e);
        // Fallback to the original string if decoding fails.
        // This might happen if the string is not base64 encoded at all.
        return str;
    }
}

interface OTDBQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export const fetchTriviaQuestions = async (difficulty: Difficulty): Promise<Question[]> => {
  // OTDB category 21 is for "Entertainment: Sports"
  const category = 21; 
  const url = `https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=${category}&difficulty=${difficulty.toLowerCase()}&type=multiple&encode=base64`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.response_code !== 0) {
      // See response codes here: https://opentdb.com/api_config.php
      // A non-zero code means the API couldn't provide questions for the request.
      throw new Error(`The trivia service couldn't provide questions for this difficulty. Please try another one.`);
    }

    const questions: Question[] = data.results.map((apiQuestion: OTDBQuestion) => {
      const correctAnswer = decodeBase64(apiQuestion.correct_answer);
      const incorrectAnswers = apiQuestion.incorrect_answers.map(decodeBase64);
      const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers]);

      return {
        question: decodeBase64(apiQuestion.question),
        options: allOptions,
        correctAnswer: correctAnswer,
      };
    });

    return questions;

  } catch (error) {
    console.error('Error fetching trivia questions from OTDB:', error);

    if (error instanceof Error && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('network'))) {
      throw new Error('A network error occurred. Please check your connection and try again.');
    }
    
    // Catch-all for other errors, including the one thrown for a non-zero response_code
    throw new Error(error instanceof Error ? error.message : 'Could not fetch new questions. Please try again shortly.');
  }
};