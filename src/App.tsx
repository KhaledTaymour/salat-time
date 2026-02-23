import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { LocationPrompt } from '@/components/layout/LocationPrompt';
import { CountdownTimer } from '@/components/prayer/CountdownTimer';
import { PrayerList } from '@/components/prayer/PrayerList';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGradient } from '@/hooks/useGradient';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useLocation } from '@/hooks/useLocation';

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useSettingsStore((s) => s.location);

  // Side-effect hooks — order matters for data flow
  useLocation();      // 1. restore location status
  usePrayerTimes();   // 2. fetch times when location ready
  useGradient();      // 3. update gradient CSS vars from prayer state

  if (!location) {
    return (
      <AppShell>
        <LocationPrompt />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header onSettingsOpen={() => setSettingsOpen(true)} />

      <main className="flex flex-col gap-4 px-4 pb-8 pt-4">
        <CountdownTimer />
        <PrayerList />
      </main>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel key="settings" onClose={() => setSettingsOpen(false)} />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
