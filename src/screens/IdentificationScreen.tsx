import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import ScreenContainer from '../components/layout/ScreenContainer';
import { consultarRuc, type RucData } from '../services/rucService';

type Props = {
  onNavigate?: (target: string) => void;
  onPersonIdentified?: (person: RucData) => void;
};

function formatDocument(value: string) {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function IdentificationScreen({ onNavigate, onPersonIdentified }: Props) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [rucData, setRucData] = useState<RucData | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualDialogVisible, setManualDialogVisible] = useState(false);
  const [manualRuc, setManualRuc] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualError, setManualError] = useState('');

  const formattedDocument = useMemo(() => {
    return formatDocument(documentNumber);
  }, [documentNumber]);

  const pressDigit = (digit: string) => {
    setDocumentNumber((prev) => {
      if (prev.length >= 8) return prev;
      return prev + digit;
    });
  };

  const backspace = () => {
    setDocumentNumber((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setDocumentNumber('');
    setRucData(null);
    setSearchDone(false);
    setErrorMessage('');
    setManualDialogVisible(false);
    setManualRuc('');
    setManualName('');
    setManualError('');
  };

  const handleContinue = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await consultarRuc(documentNumber);
      setRucData(data);
      setSearchDone(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al consultar el RUC.';
      setErrorMessage(message);
      setSearchDone(false);
      setManualRuc(documentNumber);
      setManualName('');
      setManualError('');
      setManualDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRuc = () => {
    if (rucData) {
      onPersonIdentified?.(rucData);
    }

    setSearchDone(false);
    setRucData(null);
    setDocumentNumber('');
    onNavigate?.('welcome');
  };

  const handleCancelRuc = () => {
    setSearchDone(false);
    setRucData(null);
  };

  const handleCancelManual = () => {
    setManualDialogVisible(false);
    setManualError('');
  };

  const handleAcceptManual = () => {
    const cleanRuc = manualRuc.trim();
    const cleanName = manualName.trim();

    if (!cleanRuc || !cleanName) {
      setManualError('Complete el RUC/documento y el nombre o razón social.');
      return;
    }

    onPersonIdentified?.({
      ruc: cleanRuc,
      persona: cleanName,
      estado: 'CARGA MANUAL',
      esFacturador: 'NO',
    });

    setManualDialogVisible(false);
    setErrorMessage('');
    setDocumentNumber('');
    onNavigate?.('welcome');
  };

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <ScreenContainer activeLabel="Identificación" onNavigate={onNavigate}>
      <section className="identification-layout">
        <div className="identification-info">
          <div className="step-pill">Paso 1 de 3</div>

          <h2 className="section-title">Identificación</h2>

          <p className="section-subtitle">
            Por favor, ingrese su número de documento para comenzar su atención.
          </p>

          <div className="identification-visual">
            <div className="identification-visual-overlay" />
            <i className="pi pi-id-card identification-visual-icon" />
          </div>
        </div>

        <div className="identification-panel screen-card">
          <div className="field-label">Documento Nacional</div>

          <div className="document-input-wrap">
            <i className="pi pi-credit-card document-input-icon" />
            <InputText
              value={formattedDocument}
              readOnly
              placeholder="0.000.000"
              className="document-input"
            />
          </div>

          <div className="keypad-grid">
            {keypad.map((key) => (
              <Button
                key={key}
                label={key}
                type="button"
                className="keypad-button"
                onClick={() => pressDigit(key)}
              />
            ))}


            <Button
              type="button"
              icon="pi pi-arrow-left"
              className="keypad-button keypad-icon-button"
              onClick={backspace}
            />

            <Button
              label="0"
              type="button"
              className="keypad-button"
              onClick={() => pressDigit('0')}
            />

            <Button
              type="button"
              icon="pi pi-times"
              className="keypad-button keypad-icon-button"
              onClick={clearAll}
            />
          </div>

          <Button
            label={loading ? 'Consultando...' : 'Continuar'}
            icon="pi pi-arrow-right"
            iconPos="right"
            type="button"
            className="continue-button"
            disabled={documentNumber.length < 6 || loading}
            loading={loading}
            onClick={handleContinue}
          />

      <Dialog
        visible={searchDone && !!rucData}
        onHide={handleCancelRuc}
        header="Confirmar Datos"
        modal
        className="ruc-confirmation-dialog"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={handleCancelRuc}
              className="p-button-outlined"
            />
            <Button
              label="Aceptar"
              icon="pi pi-check"
              onClick={handleAcceptRuc}
              autoFocus
            />
          </div>
        }
      >
        {rucData && (
          <div className="ruc-confirmation-content">
            <div className="ruc-data-row">
              <span className="ruc-data-label">RUC:</span>
              <span className="ruc-data-value">{rucData.ruc}</span>
            </div>
            <div className="ruc-data-row">
              <span className="ruc-data-label">Persona / Empresa:</span>
              <span className="ruc-data-value">{rucData.persona}</span>
            </div>
            <div className="ruc-data-row">
              <span className="ruc-data-label">Estado:</span>
              <span className="ruc-data-value">{rucData.estado}</span>
            </div>
            <div className="ruc-data-row">
              <span className="ruc-data-label">Es Facturador:</span>
              <span className="ruc-data-value">{rucData.esFacturador}</span>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        visible={manualDialogVisible}
        onHide={handleCancelManual}
        header="Cargar datos manualmente"
        modal
        className="ruc-confirmation-dialog"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={handleCancelManual}
              className="p-button-outlined"
            />
            <Button
              label="Continuar"
              icon="pi pi-check"
              onClick={handleAcceptManual}
              autoFocus
            />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#9a3412' }}>
              <i className="pi pi-exclamation-circle" />
              <p style={{ margin: 0 }}>{errorMessage}</p>
            </div>
          )}

          <label>
            <span className="field-label">RUC / Documento</span>
            <InputText
              value={manualRuc}
              onChange={(event) => setManualRuc(event.target.value)}
              placeholder="Ingrese RUC o documento"
              style={{ width: '100%', marginTop: 6 }}
            />
          </label>

          <label>
            <span className="field-label">Nombre o razón social</span>
            <InputText
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Ingrese nombre o razón social"
              style={{ width: '100%', marginTop: 6 }}
            />
          </label>

          {manualError && (
            <small style={{ color: '#dc2626' }}>{manualError}</small>
          )}
        </div>
      </Dialog>
        </div>
      </section>
    </ScreenContainer>
  );
}
