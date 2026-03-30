import { create } from 'zustand';
import type { LessonProgress, QuizAttempt } from '@/lib/storage';
import {
  getLessonProgress, getAllLessonProgress, saveLessonProgress,
  saveQuizAttempt,
} from '@/lib/storage';
import { LESSONS, type Lesson, type LessonStep } from '@/content/lessons/chord-lessons';

interface LessonState {
  // Lesson navigation
  lessons: readonly Lesson[];
  currentLessonId: string | null;
  currentStepIndex: number;
  progress: Map<string, LessonProgress>;

  // Quiz state
  quizActive: boolean;
  quizQuestionIndex: number;
  quizScore: number;
  quizStreak: number;
  quizCorrect: number;
  quizTotal: number;
  lastQuizResult: 'correct' | 'incorrect' | null;

  // Computed
  currentLesson: () => Lesson | null;
  currentStep: () => LessonStep | null;

  // Actions
  loadProgress: () => Promise<void>;
  startLesson: (lessonId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeLesson: (score: number) => Promise<void>;
  exitLesson: () => void;

  // Quiz actions
  startQuiz: (lessonId: string) => void;
  submitQuizAnswer: (correct: boolean) => void;
  endQuiz: () => Promise<void>;
}

export const useLessonStore = create<LessonState>()((set, get) => ({
  lessons: LESSONS,
  currentLessonId: null,
  currentStepIndex: 0,
  progress: new Map(),

  quizActive: false,
  quizQuestionIndex: 0,
  quizScore: 0,
  quizStreak: 0,
  quizCorrect: 0,
  quizTotal: 0,
  lastQuizResult: null,

  currentLesson: () => {
    const { currentLessonId, lessons } = get();
    return lessons.find(l => l.id === currentLessonId) ?? null;
  },

  currentStep: () => {
    const lesson = get().currentLesson();
    if (!lesson) return null;
    return lesson.steps[get().currentStepIndex] ?? null;
  },

  loadProgress: async () => {
    const all = await getAllLessonProgress();
    const map = new Map<string, LessonProgress>();
    for (const p of all) {
      map.set(p.lessonId, p);
    }
    set({ progress: map });
  },

  startLesson: (lessonId) => {
    set({
      currentLessonId: lessonId,
      currentStepIndex: 0,
      quizActive: false,
    });
  },

  nextStep: () =>
    set((state) => {
      const lesson = state.lessons.find(l => l.id === state.currentLessonId);
      if (!lesson) return state;
      const next = state.currentStepIndex + 1;
      if (next >= lesson.steps.length) return state;
      return { currentStepIndex: next };
    }),

  prevStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
    })),

  completeLesson: async (score) => {
    const { currentLessonId, progress } = get();
    if (!currentLessonId) return;

    const existing = await getLessonProgress(currentLessonId);
    const updated: LessonProgress = {
      lessonId: currentLessonId,
      completed: true,
      bestScore: Math.max(score, existing?.bestScore ?? 0),
      attempts: (existing?.attempts ?? 0) + 1,
      lastAttemptAt: Date.now(),
      completedAt: existing?.completedAt ?? Date.now(),
    };

    await saveLessonProgress(updated);
    const next = new Map(progress);
    next.set(currentLessonId, updated);
    set({ progress: next });
  },

  exitLesson: () => {
    set({
      currentLessonId: null,
      currentStepIndex: 0,
      quizActive: false,
      lastQuizResult: null,
    });
  },

  startQuiz: (lessonId) => {
    set({
      currentLessonId: lessonId,
      quizActive: true,
      quizQuestionIndex: 0,
      quizScore: 0,
      quizStreak: 0,
      quizCorrect: 0,
      quizTotal: 0,
      lastQuizResult: null,
    });
  },

  submitQuizAnswer: (correct) =>
    set((state) => ({
      quizCorrect: state.quizCorrect + (correct ? 1 : 0),
      quizTotal: state.quizTotal + 1,
      quizStreak: correct ? state.quizStreak + 1 : 0,
      quizScore: state.quizScore + (correct ? 10 + state.quizStreak * 2 : 0),
      quizQuestionIndex: state.quizQuestionIndex + 1,
      lastQuizResult: correct ? 'correct' : 'incorrect',
    })),

  endQuiz: async () => {
    const state = get();
    if (!state.currentLessonId) return;

    const attempt: QuizAttempt = {
      id: `${state.currentLessonId}-${Date.now()}`,
      lessonId: state.currentLessonId,
      score: state.quizScore,
      totalQuestions: state.quizTotal,
      correct: state.quizCorrect,
      streak: state.quizStreak,
      timestamp: Date.now(),
    };

    await saveQuizAttempt(attempt);
    await get().completeLesson(state.quizScore);

    set({ quizActive: false });
  },
}));
