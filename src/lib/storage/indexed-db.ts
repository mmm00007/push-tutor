/** IndexedDB wrapper using idb for structured data with migration support. */

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'push-tutor';
const DB_VERSION = 1;

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  bestScore: number;
  attempts: number;
  lastAttemptAt: number;
  completedAt: number | null;
}

export interface QuizAttempt {
  id: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correct: number;
  streak: number;
  timestamp: number;
}

export interface PracticeSession {
  id: string;
  mode: 'free' | 'guided' | 'quiz';
  duration: number;
  notesPlayed: number;
  chordsPlayed: number;
  timestamp: number;
}

interface PushTutorDB {
  lessonProgress: {
    key: string;
    value: LessonProgress;
  };
  quizAttempts: {
    key: string;
    value: QuizAttempt;
    indexes: { byLesson: string; byTimestamp: number };
  };
  practiceSessions: {
    key: string;
    value: PracticeSession;
    indexes: { byTimestamp: number };
  };
}

let dbInstance: IDBPDatabase<PushTutorDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<PushTutorDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<PushTutorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Lesson progress store
      if (!db.objectStoreNames.contains('lessonProgress')) {
        db.createObjectStore('lessonProgress', { keyPath: 'lessonId' });
      }

      // Quiz attempts store
      if (!db.objectStoreNames.contains('quizAttempts')) {
        const quizStore = db.createObjectStore('quizAttempts', { keyPath: 'id' });
        quizStore.createIndex('byLesson', 'lessonId');
        quizStore.createIndex('byTimestamp', 'timestamp');
      }

      // Practice sessions store
      if (!db.objectStoreNames.contains('practiceSessions')) {
        const sessionStore = db.createObjectStore('practiceSessions', { keyPath: 'id' });
        sessionStore.createIndex('byTimestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

// Lesson progress operations
export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  const db = await getDB();
  return db.get('lessonProgress', lessonId);
}

export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  const db = await getDB();
  return db.getAll('lessonProgress');
}

export async function saveLessonProgress(progress: LessonProgress): Promise<void> {
  const db = await getDB();
  await db.put('lessonProgress', progress);
}

// Quiz attempt operations
export async function saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
  const db = await getDB();
  await db.put('quizAttempts', attempt);
}

export async function getQuizAttemptsByLesson(lessonId: string): Promise<QuizAttempt[]> {
  const db = await getDB();
  return db.getAllFromIndex('quizAttempts', 'byLesson', lessonId);
}

// Practice session operations
export async function savePracticeSession(session: PracticeSession): Promise<void> {
  const db = await getDB();
  await db.put('practiceSessions', session);
}

export async function getRecentSessions(limit = 20): Promise<PracticeSession[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('practiceSessions', 'byTimestamp');
  return all.slice(-limit).reverse();
}
