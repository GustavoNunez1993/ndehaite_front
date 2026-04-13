import { useEffect, useState } from 'react';
import { SelectButton } from 'primereact/selectbutton';

import WelcomeScreen from './screens/WelcomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import IdentificationScreen from './screens/IdentificationScreen';
import ServiceSelectionScreen from './screens/ServiceSelectionScreen';
import TicketConfirmationScreen from './screens/TicketConfirmationScreen';
import QueueDisplayScreen from './screens/QueueDisplayScreen';
import StaffDashboardScreen from './screens/StaffDashboardScreen';
import LoginPage from './screens/LoginPage';

export type ScreenOption =
  | 'welcome'
  | 'category'
  | 'identification'
  | 'services'
  | 'ticket'
  | 'queue'
  | 'dashboard';

function getInitialScreen(): ScreenOption | 'login' {
  return window.location.pathname === '/login' ? 'login' : 'queue';
}

const options = [
  { label: 'Bienvenida', value: 'welcome' },
  { label: 'Sección', value: 'category' },
  { label: 'Identificación', value: 'identification' },
  { label: 'Servicios', value: 'services' },
  { label: 'Confirmación', value: 'ticket' },
  { label: 'Pantalla', value: 'queue' },
  { label: 'Operador', value: 'dashboard' },
];

export default function App() {
  const [screen, setScreen] = useState<ScreenOption | 'login'>(getInitialScreen);

  useEffect(() => {
    const handlePopState = () => {
      setScreen(getInitialScreen());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigate = (target: string) => {
    if (target === 'login') {
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
      {screen !== 'login' && (
        <div className="demo-switcher">
          <SelectButton
            value={screen}
            onChange={(e) => setScreen(e.value)}
            options={options}
            optionLabel="label"
            optionValue="value"
          />
        </div>
      )}

      {screen === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {screen === 'welcome' && <WelcomeScreen onNavigate={handleNavigate} />}
      {screen === 'category' && <CategoryScreen onNavigate={handleNavigate} />}
      {screen === 'identification' && <IdentificationScreen onNavigate={handleNavigate} />}
      {screen === 'services' && <ServiceSelectionScreen onNavigate={handleNavigate} />}
      {screen === 'ticket' && <TicketConfirmationScreen onNavigate={handleNavigate} />}
      {screen === 'queue' && <QueueDisplayScreen onNavigate={handleNavigate} />}
      {screen === 'dashboard' && <StaffDashboardScreen onNavigate={handleNavigate} />}
    </>
  );
}
