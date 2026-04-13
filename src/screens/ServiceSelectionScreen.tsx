import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { serviceSelectionOptions } from '../data/mockData';
import ScreenContainer from '../components/layout/ScreenContainer';

type Props = {
  onNavigate?: (target: string) => void;
};

export default function ServiceSelectionScreen({ onNavigate }: Props) {
  return (
    <ScreenContainer activeLabel="Servicios" onNavigate={onNavigate}>
      <section className="service-selection-wrap">
        <div className="service-selection-header">
          <div>
            <div className="step-pill">Paso 2: Especificación</div>
            <h2 className="section-title">Seleccione el servicio</h2>
            <p className="section-subtitle wide">
              Elija el trámite específico para <strong>Área de Firmas</strong> para continuar con
              su turno.
            </p>
          </div>

          <Card className="wait-card">
            <div className="wait-card-label">Espera Estimada</div>
            <div className="wait-card-value">8 min</div>
          </Card>
        </div>

        <div className="service-option-grid">
          {serviceSelectionOptions.map((item) => (
            <button
              key={item.id}
              className="service-option-card"
              type="button"
              onClick={() => onNavigate?.('ticket')}
            >
              <div className="service-option-left">
                <div
                  className={
                    item.accent === 'cyan'
                      ? 'service-option-icon service-option-icon-cyan'
                      : 'service-option-icon'
                  }
                >
                  <i className={item.icon} />
                </div>

                <div>
                  <h3 className="service-option-title">{item.title}</h3>
                  <p className="service-option-description">{item.description}</p>
                </div>
              </div>

              <i className="pi pi-chevron-right service-option-arrow" />
            </button>
          ))}
        </div>

        <div className="service-selection-actions">
          <Button
            label="Volver al inicio"
            icon="pi pi-arrow-left"
            className="back-home-button"
            type="button"
            onClick={() => onNavigate?.('welcome')}
          />
        </div>
      </section>
    </ScreenContainer>
  );
}