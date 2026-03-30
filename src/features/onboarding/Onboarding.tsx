import { useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import styles from './Onboarding.module.css';

const STEPS = [
  {
    title: 'Welcome to Push Tutor',
    text: 'Learn to play chords on a Push-style 8×8 grid — no piano experience needed.',
  },
  {
    title: 'The Grid',
    text: 'The grid is an 8×8 matrix of pads. Each pad plays a note. Tap any pad to hear it. You can press multiple pads at once to play chords.',
  },
  {
    title: 'Chromatic 4ths Layout',
    text: 'Moving RIGHT goes up by 1 semitone. Moving UP goes up by 5 semitones (a perfect fourth). This means chord shapes stay the same no matter where you start.',
  },
  {
    title: 'Movable Shapes',
    text: 'Unlike piano, where every key change means a new fingering, on the grid a major chord is always the same shape. Learn one shape, play it in all 12 keys instantly.',
  },
  {
    title: 'Your First Chord',
    text: 'Start with the power chord — just 2 pads. Then build up to triads and 7th chords. The lessons guide you step by step.',
  },
  {
    title: 'Ready to Play!',
    text: 'Start with Free Play to explore the grid, or jump into Lessons to learn your first chord shapes. Have fun!',
  },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useSettingsStore(s => s.completeOnboarding);

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : i < step ? styles.dotDone : ''}`}
            />
          ))}
        </div>

        <h2 className={styles.title}>{current.title}</h2>
        <p className={styles.text}>{current.text}</p>

        <div className={styles.actions}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          <button className={styles.skipBtn} onClick={completeOnboarding}>
            Skip
          </button>
          {isLast ? (
            <button className={styles.nextBtn} onClick={completeOnboarding}>
              Get Started
            </button>
          ) : (
            <button className={styles.nextBtn} onClick={() => setStep(s => s + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
