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
import ServiciosScreen from './screens/ServiciosScreen';
import TurnosScreen from './screens/TurnosScreen';
import { Toast } from 'primereact/toast';
import { toastRef } from './utils/notify';
import type { RucData } from './services/rucService';
import type { Turno } from './services/turnosService';


export type ScreenOption =
  | 'welcome'
  | 'category'
  | 'identification'
  | 'services'
  | 'ticket'
  | 'queue'
  | 'dashboard'
  | 'sections'
  | 'admin-services'
  | 'admin-turns';

const screenPaths: Record<ScreenOption | 'login', string> = {
  login: '/login',
  welcome: '/inicio',
  category: '/categorias',
  identification: '/identificacion',
  services: '/servicios',
  ticket: '/ticket',
  queue: '/informacion',
  dashboard: '/dashboard',
  sections: '/configuraciones/secciones',
  'admin-services': '/configuraciones/servicios',
  'admin-turns': '/configuraciones/turnos',
};

const pathScreens: Record<string, ScreenOption | 'login'> = {
  '/login': 'login',
  '/inicio': 'welcome',
  '/categorias': 'category',
  '/identificacion': 'identification',
  '/servicios': 'services',
  '/ticket': 'ticket',
  '/informacion': 'queue',
  '/dashboard': 'dashboard',
  '/configuraciones/secciones': 'sections',
  '/configuraciones/servicios': 'admin-services',
  '/configuraciones/turnos': 'admin-turns',
};

const identifiedPersonKey = 'identifiedPerson';
const currentTicketKey = 'currentTicket';

function isLoggedIn(): boolean {
  return !!getAccessToken();
}

function isScreenOption(target: string): target is ScreenOption {
  return target in screenPaths && target !== 'login';
}

function getInitialScreen(): ScreenOption | 'login' {
  const logged = isLoggedIn();
  const path = window.location.pathname;
  const routeScreen = pathScreens[path];

  if (!logged) return 'login';
  if (path.startsWith('/categorias/')) return 'category';
  if (routeScreen && routeScreen !== 'login') return routeScreen;
  if (path === '/login' || path === '/' || path === '') return 'identification';
  return 'identification';
}

function getInitialPerson(): RucData | null {
  const storedValue = sessionStorage.getItem(identifiedPersonKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as RucData;
  } catch {
    sessionStorage.removeItem(identifiedPersonKey);
    return null;
  }
}

function getInitialTicket(): Turno | null {
  const storedValue = sessionStorage.getItem(currentTicketKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as Turno;
  } catch {
    sessionStorage.removeItem(currentTicketKey);
    return null;
  }
}

export default function App() {
  const [screen, setScreen] = useState<ScreenOption | 'login'>(getInitialScreen);
  const [identifiedPerson, setIdentifiedPerson] = useState<RucData | null>(getInitialPerson);
  const [currentTicket, setCurrentTicket] = useState<Turno | null>(getInitialTicket);

  useEffect(() => {
    const handlePopState = () => setScreen(getInitialScreen());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (target: string) => {
    if (target === 'login') {
      clearSession();
      sessionStorage.removeItem(identifiedPersonKey);
      sessionStorage.removeItem(currentTicketKey);
      setIdentifiedPerson(null);
      setCurrentTicket(null);
      window.history.pushState({}, '', '/login');
      setScreen('login');
      return;
    }

    if (!isLoggedIn()) {
      window.history.pushState({}, '', '/login');
      setScreen('login');
      return;
    }

    if (target === 'identification') {
      sessionStorage.removeItem(identifiedPersonKey);
      sessionStorage.removeItem(currentTicketKey);
      setIdentifiedPerson(null);
      setCurrentTicket(null);
    }

    if (target.startsWith('category/')) {
      window.history.pushState({}, '', `/categorias/${target.split('/')[1]}`);
      setScreen('category');
      return;
    }

    if (!isScreenOption(target)) {
      return;
    }

    window.history.pushState({}, '', screenPaths[target]);
    setScreen(target);
  };

  const handlePersonIdentified = (person: RucData) => {
    sessionStorage.setItem(identifiedPersonKey, JSON.stringify(person));
    setIdentifiedPerson(person);
  };

  const handleTicketCreated = (ticket: Turno) => {
    sessionStorage.setItem(currentTicketKey, JSON.stringify(ticket));
    setCurrentTicket(ticket);
  };

  return (
    <>
     <Toast ref={toastRef} position="top-right" />
      {screen === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {screen === 'welcome' && (
        <WelcomeScreen
          onNavigate={handleNavigate}
          personName={identifiedPerson?.persona}
          documentNumber={identifiedPerson?.ruc}
          onTicketCreated={handleTicketCreated}
        />
      )}
      {screen === 'category' && <CategoryScreen onNavigate={handleNavigate} />}
      {screen === 'identification' && (
        <IdentificationScreen
          onNavigate={handleNavigate}
          onPersonIdentified={handlePersonIdentified}
        />
      )}
      {screen === 'services' && <ServiceSelectionScreen onNavigate={handleNavigate} />}
      {screen === 'ticket' && (
        <TicketConfirmationScreen
          onNavigate={handleNavigate}
          ticket={currentTicket}
        />
      )}
      {screen === 'queue' && <QueueDisplayScreen onNavigate={handleNavigate} />}
      {screen === 'dashboard' && <StaffDashboardScreen onNavigate={handleNavigate} />}
      {screen === 'sections' && <SeccionesScreen onNavigate={handleNavigate} />}
      {screen === 'admin-services' && <ServiciosScreen onNavigate={handleNavigate} />}
      {screen === 'admin-turns' && <TurnosScreen onNavigate={handleNavigate} />}
    </>
  );
}
