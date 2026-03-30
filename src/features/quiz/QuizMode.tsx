import { useState, useCallback, useEffect, useRef } from 'react';
import { useLessonStore } from '@/stores/lesson-store';
import { useGridStore } from '@/stores/grid-store';
import { useAudioStore } from '@/stores/audio-store';
import { Grid } from '@/components/Grid/Grid';
import { type PadState } from '@/components/Grid/Pad';
import type { QuizQuestion } from '@/content/lessons/chord-lessons';
import styles from './QuizMode.module.css';

export function QuizMode() {
  const lessons = useLessonStore(s => s.lessons);
  const quizActive = useLessonStore(s => s.quizActive);
  const quizQuestionIndex = useLessonStore(s => s.quizQuestionIndex);
  const quizScore = useLessonStore(s => s.quizScore);
  const quizStreak = useLessonStore(s => s.quizStreak);
  const quizCorrect = useLessonStore(s => s.quizCorrect);
  const quizTotal = useLessonStore(s => s.quizTotal);
  const lastResult = useLessonStore(s => s.lastQuizResult);
  const startQuiz = useLessonStore(s => s.startQuiz);
  const submitAnswer = useLessonStore(s => s.submitQuizAnswer);
  const endQuiz = useLessonStore(s => s.endQuiz);

  const activeNotes = useGridStore(s => s.activeNotes);
  const pads = useGridStore(s => s.pads);
  const config = useGridStore(s => s.config);
  const allNotesOff = useGridStore(s => s.allNotesOff);
  const audioAllOff = useAudioStore(s => s.allNotesOff);

  const [selectedLesson, setSelectedLesson] = useState<string>(lessons[0]?.id ?? '');
  const [padOverrides, setPadOverrides] = useState<Map<string, PadState>>(new Map());
  const checkTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Get all quiz questions for current lesson
  const currentLesson = lessons.find(l => l.id === selectedLesson);
  const questions = currentLesson?.quizQuestions ?? [];
  const currentQuestion: QuizQuestion | undefined = questions[quizQuestionIndex % questions.length];
  const quizFinished = quizTotal >= questions.length && questions.length > 0;

  // Check if the played notes match the target chord
  const checkAnswer = useCallback(() => {
    if (!currentQuestion || !quizActive) return;

    const { rootPitchClass, acceptedShape } = currentQuestion;
    const pressedNotes = [...activeNotes];
    if (pressedNotes.length < acceptedShape.length) return;

    // Find if any pressed note could be the root with the right pitch class
    const rootCandidates = pressedNotes.filter(
      midi => ((midi % 12) + 12) % 12 === rootPitchClass
    );

    let correct = false;
    for (const rootMidi of rootCandidates) {
      // Compare pitch-class distances (mod 12) to handle octave-crossing voicings
      const expectedPCs = new Set(acceptedShape.map(s => (((s.dx + s.dy * 5) % 12) + 12) % 12));
      const actualPCs = new Set(pressedNotes.map(n => (((n - rootMidi) % 12) + 12) % 12));

      if (expectedPCs.size === actualPCs.size &&
          [...expectedPCs].every(i => actualPCs.has(i))) {
        correct = true;
        break;
      }
    }

    // Visual feedback — find pad positions for pressed MIDI notes
    const overrides = new Map<string, PadState>();
    const state = correct ? 'targetCorrect' as const : 'targetIncorrect' as const;
    for (const row of pads) {
      for (const pad of row) {
        if (pad.midi !== null && pressedNotes.includes(pad.midi)) {
          overrides.set(`${pad.x},${pad.y}`, state);
        }
      }
    }
    setPadOverrides(overrides);

    // Submit after brief visual feedback
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    checkTimeout.current = setTimeout(() => {
      submitAnswer(correct);
      setPadOverrides(new Map());
      allNotesOff();
      audioAllOff();
    }, 600);
  }, [currentQuestion, quizActive, activeNotes, submitAnswer, allNotesOff, audioAllOff]);

  // Trigger check when enough notes are held
  useEffect(() => {
    if (!currentQuestion || !quizActive) return;
    if (activeNotes.size >= currentQuestion.acceptedShape.length) {
      checkAnswer();
    }
  }, [activeNotes.size, checkAnswer, currentQuestion, quizActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkTimeout.current) clearTimeout(checkTimeout.current);
    };
  }, []);

  if (!quizActive) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Quiz Mode</h2>
        <p className={styles.subheading}>
          Test your chord shape knowledge. Play the requested chord on the grid.
        </p>
        <div className={styles.selectGroup}>
          <label className={styles.label} htmlFor="quiz-lesson">Choose a lesson:</label>
          <select
            id="quiz-lesson"
            className={styles.select}
            value={selectedLesson}
            onChange={e => setSelectedLesson(e.target.value)}
          >
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
        <button
          className={styles.startBtn}
          onClick={() => startQuiz(selectedLesson)}
          disabled={!selectedLesson}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (quizFinished) {
    const pct = questions.length > 0 ? Math.round((quizCorrect / questions.length) * 100) : 0;
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Quiz Complete!</h2>
        <div className={styles.results}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Score</span>
            <span className={styles.resultValue}>{quizScore}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Accuracy</span>
            <span className={styles.resultValue}>{pct}%</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Correct</span>
            <span className={styles.resultValue}>{quizCorrect} / {questions.length}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Best Streak</span>
            <span className={styles.resultValue}>{quizStreak}</span>
          </div>
        </div>
        <button className={styles.startBtn} onClick={() => endQuiz()}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className={styles.quizPlay}>
      <div className={styles.quizHeader}>
        <span className={styles.quizPrompt}>{currentQuestion?.prompt}</span>
        <div className={styles.quizStats}>
          <span>Score: {quizScore}</span>
          <span>Streak: {quizStreak}</span>
          <span>{quizQuestionIndex + 1} / {questions.length}</span>
        </div>
        {lastResult && (
          <span className={`${styles.feedback} ${styles[lastResult]}`}>
            {lastResult === 'correct' ? 'Correct!' : 'Try again'}
          </span>
        )}
      </div>
      <Grid padStateOverrides={padOverrides} />
    </div>
  );
}
