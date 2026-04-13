import type { ReactNode } from 'react';
import AppTopbar from './AppTopbar';

type ScreenContainerProps = {
  children: ReactNode;
  activeLabel?: string;
  onNavigate?: (target: string) => void;
};

export default function ScreenContainer({
  children,
  activeLabel = 'Servicios',
  onNavigate,
}: ScreenContainerProps) {
  return (
    <div className="app-shell">
      <AppTopbar activeLabel={activeLabel} onNavigate={onNavigate} />
      <main className="screen-main">{children}</main>
    </div>
  );
}