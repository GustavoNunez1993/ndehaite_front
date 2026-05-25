import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import ScreenContainer from '../components/layout/ScreenContainer';
import { listarTurnos, type Turno } from '../services/turnosService';

type Props = {
  onNavigate?: (target: string) => void;
};

type TurnoSocketMessage = {
  type: string;
  turno: Turno;
};

function speakableTurn(code: string) {
  return code.split('').map((char) => (char === '-' ? ' ' : char)).join(' ');
}

function speakableModule(code: string) {
  return code.split('').join(' ');
}

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || 'http://localhost:8084/api').replace(/\/$/, '');
}

function getTurnosSocketUrl() {
  const apiUrl = getApiBaseUrl();
  const httpUrl = new URL(apiUrl);

  httpUrl.protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  httpUrl.pathname = '/ws/turnos';
  httpUrl.search = '';

  return httpUrl.toString();
}

function sortBySequence(turnos: Turno[]) {
  return [...turnos].sort((a, b) => (a.numeroSecuencia || 0) - (b.numeroSecuencia || 0));
}

export default function QueueDisplayScreen({ onNavigate }: Props) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const lastSpokenTurnId = useRef<string | null>(null);
  const currentTurn = useMemo(() => {
    return [...turnos]
      .filter((turno) => turno.estadoTurno === 'LLAMADO')
      .sort((a, b) => {
        const aDate = a.fechaHoraLlamado ? new Date(a.fechaHoraLlamado).getTime() : 0;
        const bDate = b.fechaHoraLlamado ? new Date(b.fechaHoraLlamado).getTime() : 0;

        return bDate - aDate;
      })[0] || null;
  }, [turnos]);
  const nextTurns = useMemo(() => {
    return sortBySequence(turnos.filter((turno) => turno.estadoTurno === 'EN_ESPERA')).slice(0, 4);
  }, [turnos]);
  const currentTurnNumber = currentTurn?.numeroTurno || '-';
  const currentModule = currentTurn?.moduloActual || '00';
  const currentService = currentTurn?.seccionDescripcion || '-';

  const callTurnByVoice = useCallback(() => {
    if (!currentTurn || !('speechSynthesis' in window)) return;

    const text = `Turno ${speakableTurn(currentTurn.numeroTurno)}, pasar al módulo ${speakableModule(
      currentModule
    )}. Servicio ${currentService}.`;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith('es')) || null;

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [currentModule, currentService, currentTurn]);

  const handleAudioButton = () => {
    setAudioEnabled(true);
    callTurnByVoice();
  };

  const upsertTurno = useCallback((turno: Turno) => {
    setTurnos((current) => {
      const exists = current.some((item) => item.id === turno.id);

      if (!exists) {
        return [...current, turno];
      }

      return current.map((item) => (item.id === turno.id ? turno : item));
    });
  }, []);

  useEffect(() => {
    listarTurnos()
      .then(setTurnos)
      .catch(() => {
        setTurnos([]);
      });
  }, []);

  useEffect(() => {
    let reconnectTimeout: number | undefined;
    let closedByEffect = false;
    let socket: WebSocket | null = null;

    const connect = () => {
      setSocketStatus('connecting');
      socket = new WebSocket(getTurnosSocketUrl());

      socket.onopen = () => {
        setSocketStatus('connected');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as TurnoSocketMessage;

        if (message.turno) {
          upsertTurno(message.turno);
        }
      };

      socket.onclose = () => {
        setSocketStatus('disconnected');

        if (!closedByEffect) {
          reconnectTimeout = window.setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closedByEffect = true;

      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }

      socket?.close();
    };
  }, [upsertTurno]);

  useEffect(() => {
    if (!audioEnabled || !currentTurn || lastSpokenTurnId.current === currentTurn.id || !('speechSynthesis' in window)) {
      return undefined;
    }

    const run = () => {
      lastSpokenTurnId.current = currentTurn.id;
      callTurnByVoice();
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        run();
      };
    } else {
      run();
    }

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [audioEnabled, callTurnByVoice, currentTurn]);

  return (
    <ScreenContainer activeLabel="Información" onNavigate={onNavigate}>
      <section className="queue-display-layout">
        <div className="queue-main">
          <div className="queue-live-badge">
            <i className="pi pi-volume-up" />
            <span>Llamando ahora</span>
          </div>

          <div className="queue-main-content">
            <div>
              <p className="queue-label">Turno</p>
              <div className="queue-turn">{currentTurnNumber}</div>
              <div className="queue-service">Servicio: {currentService}</div>
            </div>

            <div className="queue-arrow">
              <i className="pi pi-arrow-right" />
            </div>

            <div className="queue-module-block">
              <p className="queue-label">Módulo / Escritorio</p>
              <div className="queue-module">{currentModule}</div>
            </div>
          </div>

          <div className="queue-footer">
            <div className="queue-footer-user">
              <div className="queue-user-icon">
                <i className="pi pi-user" />
              </div>
              <div>
                <p className="queue-footer-title">Atención preferencial</p>
                <p className="queue-footer-subtitle">Trámites generales de autenticación</p>
              </div>
            </div>

            <div className="queue-footer-actions">
              <Button
                label={audioEnabled ? 'Repetir llamado' : 'Activar audio'}
                icon="pi pi-volume-up"
                type="button"
                className="queue-call-button"
                disabled={!currentTurn}
                onClick={handleAudioButton}
              />

              <div className="queue-footer-note">
                {socketStatus === 'connected'
                  ? 'Pantalla conectada en tiempo real'
                  : 'Reconectando pantalla en tiempo real'}
              </div>
            </div>
          </div>
        </div>

        <aside className="queue-sidebar">
          <h3 className="queue-sidebar-title">Siguientes turnos</h3>

          <div className="queue-next-list">
            {nextTurns.map((item) => (
              <div key={item.id} className="queue-next-item">
                <div>
                  <div className="queue-next-code">{item.numeroTurno}</div>
                  <div className="queue-next-service">{item.seccionDescripcion}</div>
                </div>

                <div className="queue-next-icon">
                  <i className="pi pi-clock" />
                </div>
              </div>
            ))}
          </div>

          <div className="queue-wait-box">
            <div>
              <strong>Tiempo estimado</strong>
              <p>Basado en el flujo actual de usuarios</p>
            </div>
            <div className="queue-wait-time">12 min</div>
          </div>
        </aside>
      </section>
    </ScreenContainer>
  );
}
