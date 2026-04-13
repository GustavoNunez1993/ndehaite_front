import { Button } from 'primereact/button';
import ScreenContainer from '../components/layout/ScreenContainer';

type Props = {
  onNavigate?: (target: string) => void;
};

export default function StaffDashboardScreen({ onNavigate }: Props) {
  return (
    <ScreenContainer activeLabel="Dashboard" onNavigate={onNavigate}>
      <section className="staff-dashboard-layout">
        <div className="staff-main">
          <div className="staff-current-card">
            <div className="staff-current-top">
              <div>
                <span className="staff-badge">Now Serving</span>
                <h2 className="staff-turn-number">A-142</h2>
                <p className="staff-turn-section">SECTION: FINANCIAL HUB</p>
              </div>

              <div className="staff-wait-box">
                <p>Wait Time</p>
                <strong>12:45</strong>
              </div>
            </div>

            <div className="staff-actions-grid">
              <Button
                label="COMPLETED"
                icon="pi pi-check-circle"
                className="staff-action-complete"
                type="button"
              />
              <Button
                label="RE-CALL"
                icon="pi pi-megaphone"
                className="staff-action-light"
                type="button"
              />
              <Button
                label="NO-SHOW"
                icon="pi pi-user-minus"
                className="staff-action-light"
                type="button"
              />
              <Button
                label="TRANSFER"
                icon="pi pi-arrow-up-right"
                className="staff-action-light"
                type="button"
              />
            </div>
          </div>

          <div className="staff-call-next">
            <Button
              label="CALL NEXT TURN"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="staff-call-next-button"
              type="button"
            />
          </div>

          <div className="staff-bottom-grid">
            <div className="staff-detail-card">
              <h3>Turn Details</h3>

              <div className="staff-person-row">
                <div className="staff-avatar">
                  <i className="pi pi-user" />
                </div>

                <div>
                  <strong>Ricardo Alarcón</strong>
                  <p>ID: 10.452.XXX-K</p>
                </div>
              </div>

              <div className="staff-detail-list">
                <div>
                  <span>Service Requested</span>
                  <strong>Firma F1 (Notary)</strong>
                </div>
                <div>
                  <span>Priority Status</span>
                  <strong>Standard</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>General Services</strong>
                </div>
              </div>
            </div>

            <div className="staff-detail-card">
              <h3>Notas del operador</h3>
              <div className="staff-notes-box">
                Cliente en ventanilla. Documentación parcial presentada. Verificar autenticación y
                firma antes de cerrar el turno.
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScreenContainer>
  );
}