import { useLessonStore } from '@/stores/lesson-store';
import { useAudioStore } from '@/stores/audio-store';
import { Grid } from '@/components/Grid/Grid';
import { chordNotes } from '@/lib/music-theory/chords';
import { CHORDS } from '@/lib/music-theory';
import styles from './LessonView.module.css';

export function LessonView() {
  const lesson = useLessonStore(s => s.currentLesson());
  const step = useLessonStore(s => s.currentStep());
  const stepIndex = useLessonStore(s => s.currentStepIndex);
  const nextStep = useLessonStore(s => s.nextStep);
  const prevStep = useLessonStore(s => s.prevStep);
  const exitLesson = useLessonStore(s => s.exitLesson);
  const completeLesson = useLessonStore(s => s.completeLesson);
  const noteOn = useAudioStore(s => s.noteOn);
  const noteOff = useAudioStore(s => s.noteOff);

  if (!lesson || !step) return null;

  const isLastStep = stepIndex === lesson.steps.length - 1;

  const handlePlayChord = () => {
    const rootMidi = step.rootMidi ?? 48;
    const chord = CHORDS[lesson.chordType];
    if (!chord) return;
    const notes = chordNotes(rootMidi, chord);
    notes.forEach(n => noteOn(n, 0.7));
    setTimeout(() => notes.forEach(n => noteOff(n)), 1200);
  };

  const handleComplete = async () => {
    await completeLesson(100);
    exitLesson();
  };

  // Determine root position on the grid for target shape display
  // Default root position: bottom-left area
  const targetRootX = 1;
  const targetRootY = 1;

  const showGrid = step.type !== 'explain';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={exitLesson} aria-label="Exit lesson">
          ← Back
        </button>
        <h2 className={styles.title}>{lesson.title}</h2>
        <span className={styles.stepCounter}>
          {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>

      <div className={styles.body}>
        {showGrid && (
          <div className={styles.gridArea}>
            <Grid
              targetShape={step.targetShape}
              targetRootX={targetRootX}
              targetRootY={targetRootY}
            />
          </div>
        )}

        <div className={styles.textArea}>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.stepText}>{step.text}</p>

          {(step.type === 'demonstrate' || step.type === 'explain') && (
            <button className={styles.actionBtn} onClick={handlePlayChord}>
              Hear the Chord
            </button>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.navBtn}
          onClick={prevStep}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        {isLastStep ? (
          <button className={styles.completeBtn} onClick={handleComplete}>
            Complete Lesson
          </button>
        ) : (
          <button className={styles.navBtn} onClick={nextStep}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
