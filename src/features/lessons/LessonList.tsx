import { useEffect } from 'react';
import { useLessonStore } from '@/stores/lesson-store';
import styles from './LessonList.module.css';

export function LessonList() {
  const lessons = useLessonStore(s => s.lessons);
  const progress = useLessonStore(s => s.progress);
  const loadProgress = useLessonStore(s => s.loadProgress);
  const startLesson = useLessonStore(s => s.startLesson);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Chord Lessons</h2>
      <p className={styles.subheading}>
        Learn movable chord shapes on the grid. Each shape works from any root note.
      </p>
      <div className={styles.list}>
        {[...lessons].sort((a, b) => a.order - b.order).map(lesson => {
          const p = progress.get(lesson.id);
          return (
            <button
              key={lesson.id}
              className={styles.card}
              onClick={() => startLesson(lesson.id)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{lesson.title}</span>
                {p?.completed && <span className={styles.badge} aria-label="Completed">✓</span>}
              </div>
              <span className={styles.cardSubtitle}>{lesson.subtitle}</span>
              <span className={styles.cardDesc}>{lesson.description}</span>
              {p && (
                <span className={styles.cardProgress}>
                  Best: {p.bestScore} · Attempts: {p.attempts}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
