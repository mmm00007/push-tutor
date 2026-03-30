import { AudioGate } from '@/components/AudioGate/AudioGate';
import { AppShell } from '@/components/Layout/AppShell';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { FreePlay } from '@/features/practice/FreePlay';
import { LessonList } from '@/features/lessons/LessonList';
import { LessonView } from '@/features/lessons/LessonView';
import { QuizMode } from '@/features/quiz/QuizMode';
import { Settings } from '@/features/settings/Settings';
import { useSettingsStore } from '@/stores/settings-store';
import { useLessonStore } from '@/stores/lesson-store';

function ScreenRouter() {
  const screen = useSettingsStore(s => s.currentScreen);
  const currentLessonId = useLessonStore(s => s.currentLessonId);
  const quizActive = useLessonStore(s => s.quizActive);

  // Lesson/quiz view takes over when active
  if (screen === 'lessons' && currentLessonId && !quizActive) {
    return <LessonView />;
  }

  switch (screen) {
    case 'practice':
      return <FreePlay />;
    case 'lessons':
      return <LessonList />;
    case 'quiz':
      return <QuizMode />;
    case 'settings':
      return <Settings />;
    default:
      return <FreePlay />;
  }
}

export function App() {
  const onboardingComplete = useSettingsStore(s => s.onboardingComplete);

  return (
    <AudioGate>
      {!onboardingComplete && <Onboarding />}
      <AppShell>
        <ScreenRouter />
      </AppShell>
    </AudioGate>
  );
}
