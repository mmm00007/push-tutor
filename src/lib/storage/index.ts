export {
  type AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  getItem,
  setItem,
  removeItem,
} from './local-storage';

export {
  type LessonProgress,
  type QuizAttempt,
  type PracticeSession,
  getDB,
  getLessonProgress,
  getAllLessonProgress,
  saveLessonProgress,
  saveQuizAttempt,
  getQuizAttemptsByLesson,
  savePracticeSession,
  getRecentSessions,
} from './indexed-db';
