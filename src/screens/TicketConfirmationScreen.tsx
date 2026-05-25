import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import ScreenContainer from '../components/layout/ScreenContainer';
import type { Turno } from '../services/turnosService';

type Props = {
  onNavigate?: (target: string) => void;
  ticket?: Turno | null;
};

export default function TicketConfirmationScreen({ onNavigate, ticket }: Props) {
  return (
    <ScreenContainer activeLabel="Servicios" onNavigate={onNavigate}>
      <section className="ticket-confirmation-layout">
        <div className="ticket-hero">
          <div className="ticket-hero-badge">
            <i className="pi pi-check-circle" />
            <span>Asignación Exitosa</span>
          </div>

          <div>
            <h2 className="ticket-hero-title">¡Su turno ha sido asignado!</h2>
            <p className="ticket-hero-subtitle">
              Por favor, permanezca atento a las pantallas de la sala principal.
            </p>
          </div>

          <div className="ticket-turn-block">
            <p className="ticket-turn-label">Su Turno</p>
            <div className="ticket-turn-number">{ticket?.numeroTurno || '-'}</div>
          </div>
        </div>

        <div className="ticket-side">
          <Card className="ticket-info-card">
            <div className="ticket-info-label">Tiempo Estimado</div>
            <div className="ticket-info-time">
              <span>12</span>
              <small>minutos</small>
            </div>

            <div className="ticket-mini-box">
              <i className="pi pi-users" />
              <span>4 personas antes que usted</span>
            </div>
          </Card>

          <div className="ticket-actions">
            <Button
              label="Imprimir Ticket"
              icon="pi pi-print"
              className="ticket-action-primary"
              type="button"
            />
            <Button
              label="Finalizar"
              icon="pi pi-check"
              className="ticket-action-secondary"
              type="button"
              onClick={() => onNavigate?.('identification')}
            />
          </div>
        </div>
      </section>
    </ScreenContainer>
  );
}
