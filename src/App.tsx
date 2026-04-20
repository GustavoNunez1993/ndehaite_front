import { useEffect, useState } from 'react';

import WelcomeScreen from './screens/WelcomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import IdentificationScreen from './screens/IdentificationScreen';
import ServiceSelectionScreen from './screens/ServiceSelectionScreen';
import TicketConfirmationScreen from './screens/TicketConfirmationScreen';
import QueueDisplayScreen from './screens/QueueDisplayScreen';
import StaffDashboardScreen from './screens/StaffDashboardScreen';
import LoginPage from './screens/LoginPage';
import { getAccessToken, clearSession } from './services/authStorage';
import SeccionesScreen from './screens/SeccionesScreen';

export type ScreenOption =
  | 'welcome'
  | 'category'
  | 'identification'
  | 'services'
  | 'ticket'
  | 'queue'
  | 'dashboard';

function isLoggedIn(): boolean {
  return !!getAccessToken();
}

function getInitialScreen(): ScreenOption | 'login' {
  const logged = isLoggedIn();
  const path = window.location.pathname;

  if (!logged) return 'login';
  if (path === '/login') return 'dashboard';
  return 'queue';
}

export default function App() {
  const [screen, setScreen] = useState<ScreenOption | 'login'>(getInitialScreen);

  useEffect(() => {
    const handlePopState = () => setScreen(getInitialScreen());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (target: string) => {
    if (target === 'login') {
      clearSession();
      window.history.pushState({}, '', '/login');
      setScreen('login');
      return;
    }

    if (!isLoggedIn()) {
      window.history.pushState({}, '', '/login');
      setScreen('login');
      return;
    }

    if (screen === 'login') {
      window.history.pushState({}, '', '/');
    }

    setScreen(target as ScreenOption);
  };

  return (
    <>
      {screen === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {screen === 'welcome' && <WelcomeScreen onNavigate={handleNavigate} />}
      {screen === 'category' && <CategoryScreen onNavigate={handleNavigate} />}
      {screen === 'identification' && <IdentificationScreen onNavigate={handleNavigate} />}
      {screen === 'services' && <ServiceSelectionScreen onNavigate={handleNavigate} />}
      {screen === 'ticket' && <TicketConfirmationScreen onNavigate={handleNavigate} />}
      {screen === 'queue' && <QueueDisplayScreen onNavigate={handleNavigate} />}
      {screen === 'dashboard' && <StaffDashboardScreen onNavigate={handleNavigate} />}
      {screen === 'sections' && <SeccionesScreen onNavigate={handleNavigate} />}
    </>
  );
}