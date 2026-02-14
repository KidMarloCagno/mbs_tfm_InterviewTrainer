import { create } from "zustand";
import type { GameQuestion } from "@/components/game/GameEngine";

interface GameSessionState {
  sessionQuestions: GameQuestion[];
  currentQuestionIndex: number;
  score: number;
  isFinished: boolean;
  startSession: (questions: GameQuestion[]) => void;
  answerQuestion: (isCorrect: boolean) => void;
  nextQuestion: () => void;
  resetSession: () => void;
  interleaveQuestions: (questions: GameQuestion[], maxQuestions?: number) => GameQuestion[];
}

const initialState = {
  sessionQuestions: [] as GameQuestion[],
  currentQuestionIndex: 0,
  score: 0,
  isFinished: false,
};

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const useGameStore = create<GameSessionState>((set, get) => ({
  ...initialState,

  interleaveQuestions: (questions, maxQuestions = 10) => {
    const byCategory = new Map<string, GameQuestion[]>();

    for (const question of questions) {
      const categoryQuestions = byCategory.get(question.category) ?? [];
      categoryQuestions.push(question);
      byCategory.set(question.category, categoryQuestions);
    }

    const categoryPools = Array.from(byCategory.values()).map((pool) => shuffle(pool));
    const interleaved: GameQuestion[] = [];

    while (interleaved.length < maxQuestions) {
      let addedThisRound = false;

      for (const pool of categoryPools) {
        const item = pool.pop();
        if (!item) {
          continue;
        }

        interleaved.push(item);
        addedThisRound = true;

        if (interleaved.length >= maxQuestions) {
          break;
        }
      }

      if (!addedThisRound) {
        break;
      }
    }

    return shuffle(interleaved);
  },

  startSession: (questions) => {
    const mixedQuestions = get().interleaveQuestions(questions, Math.min(10, questions.length));

    set({
      sessionQuestions: mixedQuestions,
      currentQuestionIndex: 0,
      score: 0,
      isFinished: mixedQuestions.length === 0,
    });
  },

  answerQuestion: (isCorrect) => {
    if (!isCorrect) {
      return;
    }

    set((state) => ({ score: state.score + 1 }));
  },

  nextQuestion: () => {
    set((state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      const isFinished = nextIndex >= state.sessionQuestions.length;

      return {
        currentQuestionIndex: isFinished ? state.currentQuestionIndex : nextIndex,
        isFinished,
      };
    });
  },

  resetSession: () => set(initialState),
}));
