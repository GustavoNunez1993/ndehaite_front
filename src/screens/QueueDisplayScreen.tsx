import { useCallback, useEffect } from 'react';
import { Button } from 'primereact/button';
import ScreenContainer from '../components/layout/ScreenContainer';

type Props = {
  onNavigate?: (target: string) => void;
};

const nextTurns = [
  { code: 'A-112', service: 'Caja Principal' },
  { code: 'B-046', service: 'Firma F2' },
  { code: 'C-021', service: 'Atención General' },
  { code: 'D-008', service: 'Entregas' },
];

function speakableTurn(code: string) {
  return code.split('').map((char) => (char === '-' ? ' ' : char)).join(' ');
}

function speakableModule(code: string) {
  return code.split('').join(' ');
}

export default function QueueDisplayScreen({ onNavigate }: Props) {
  const currentTurn = 'B-045';
  const currentModule = '04';
  const currentService = 'Firma F1';

  const callTurnByVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    const text = `Turno ${speakableTurn(currentTurn)}, pasar al módulo ${speakableModule(
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
  }, [currentTurn, currentModule, currentService]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const run = () => {
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
  }, [callTurnByVoice]);

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
              <div className="queue-turn">{currentTurn}</div>
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
                label="Llamar turno"
                icon="pi pi-volume-up"
                type="button"
                className="queue-call-button"
                onClick={callTurnByVoice}
              />

              <div className="queue-footer-note">Por favor diríjase al módulo indicado</div>
            </div>
          </div>
        </div>

        <aside className="queue-sidebar">
          <h3 className="queue-sidebar-title">Siguientes turnos</h3>

          <div className="queue-next-list">
            {nextTurns.map((item) => (
              <div key={item.code} className="queue-next-item">
                <div>
                  <div className="queue-next-code">{item.code}</div>
                  <div className="queue-next-service">{item.service}</div>
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