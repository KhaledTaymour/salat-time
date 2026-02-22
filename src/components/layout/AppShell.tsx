import type { ReactNode } from 'react';
import { GradientBackground } from './GradientBackground';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-dvh text-white">
      <GradientBackground />
      <div className="relative mx-auto max-w-sm min-h-dvh flex flex-col">
        {children}
      </div>
    </div>
  );
}
