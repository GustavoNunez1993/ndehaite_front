import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ScreenContainer from '../components/layout/ScreenContainer';
import { personRecords, type PersonRecord } from '../data/mockData';

type Props = {
  onNavigate?: (target: string) => void;
};

function formatDocument(value: string) {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function IdentificationScreen({ onNavigate }: Props) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchedRows, setSearchedRows] = useState<PersonRecord[]>([]);
  const [searchDone, setSearchDone] = useState(false);

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
    setSearchedRows([]);
    setSearchDone(false);
  };

  const handleContinue = () => {
    const result = personRecords.filter(
      (item) => item.documento === documentNumber
    );

    setSearchedRows(result);
    setSearchDone(true);
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
            label="Continuar"
            icon="pi pi-arrow-right"
            iconPos="right"
            type="button"
            className="continue-button"
            disabled={documentNumber.length < 6}
            onClick={handleContinue}
          />

          {searchDone && (
            <div className="identification-result-block">
              <div className="field-label">Datos encontrados</div>

              <DataTable
                value={searchedRows}
                className="identification-table"
                emptyMessage="No se encontraron datos para el documento ingresado."
                responsiveLayout="scroll"
                size="small"
              >
                <Column field="documento" header="Documento" />
                <Column field="nombre" header="Nombre" />
                <Column field="apellido" header="Apellido" />
                <Column field="telefono" header="Teléfono" />
                <Column field="email" header="Email" />
                <Column field="direccion" header="Dirección" />
              </DataTable>

              {searchedRows.length > 0 && (
                <div className="identification-result-actions">
                  <Button
                    label="Seguir a servicios"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    type="button"
                    className="result-next-button"
                    onClick={() => onNavigate?.('services')}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </ScreenContainer>
  );
}