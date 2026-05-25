import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ScreenContainer from '../components/layout/ScreenContainer';
import {
  llamarTurno,
  listarTurnos,
  marcarTurnoAusente,
  type Turno,
} from '../services/turnosService';

type Props = {
  onNavigate?: (target: string) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function sortByPriorityAndSequence(turnos: Turno[]) {
  const priorityWeight: Record<string, number> = {
    URGENTE: 0,
    VIP: 1,
    PREFERENCIAL: 2,
    NORMAL: 3,
  };

  return [...turnos].sort((a, b) => {
    const priorityDiff = (priorityWeight[a.prioridadTurno] ?? 9) - (priorityWeight[b.prioridadTurno] ?? 9);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return (a.numeroSecuencia || 0) - (b.numeroSecuencia || 0);
  });
}

function getLastCalledTurn(turnos: Turno[]) {
  return [...turnos]
    .filter((turno) => turno.estadoTurno === 'LLAMADO')
    .sort((a, b) => {
      const aDate = a.fechaHoraLlamado ? new Date(a.fechaHoraLlamado).getTime() : 0;
      const bDate = b.fechaHoraLlamado ? new Date(b.fechaHoraLlamado).getTime() : 0;

      if (aDate !== bDate) {
        return bDate - aDate;
      }

      return (b.numeroSecuencia || 0) - (a.numeroSecuencia || 0);
    })[0] || null;
}

export default function StaffDashboardScreen({ onNavigate }: Props) {
  const toast = useRef<Toast>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [markingAbsent, setMarkingAbsent] = useState(false);
  const currentTurn = useMemo(() => {
    return getLastCalledTurn(turnos);
  }, [turnos]);
  const waitingTurns = useMemo(() => {
    return sortByPriorityAndSequence(turnos.filter((turno) => turno.estadoTurno === 'EN_ESPERA'));
  }, [turnos]);
  const nextTurn = waitingTurns[0] || null;

  const fetchTurnos = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await listarTurnos();
      setTurnos(data);
    } catch (e: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(e, 'No se pudieron cargar los turnos'),
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchTurnos(false);
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [fetchTurnos]);

  const handleCall = async (turno: Turno | null) => {
    if (!turno) {
      return;
    }

    setCallingId(turno.id);

    try {
      const calledTurn = await llamarTurno(turno.id);
      setTurnos((current) => {
        const exists = current.some((item) => item.id === calledTurn.id);

        if (!exists) {
          return [...current, calledTurn];
        }

        return current.map((item) => (item.id === calledTurn.id ? calledTurn : item));
      });
      toast.current?.show({
        severity: 'success',
        summary: 'Turno llamado',
        detail: `Se llamó el turno ${turno.numeroTurno}`,
      });
      fetchTurnos(false);
    } catch (e: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(e, 'No se pudo llamar el turno'),
      });
    } finally {
      setCallingId(null);
    }
  };

  const callActionTemplate = (row: Turno) => (
    <Button
      icon="pi pi-megaphone"
      rounded
      severity="success"
      tooltip="Llamar"
      loading={callingId === row.id}
      onClick={() => handleCall(row)}
    />
  );

  const handleMarkAbsent = () => {
    if (!currentTurn) {
      return;
    }

    confirmDialog({
      message: `¿Cancelar el turno ${currentTurn.numeroTurno} por ausencia del cliente?`,
      header: 'Cliente no se presentó',
      icon: 'pi pi-user-minus',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Marcar ausente',
      rejectLabel: 'Volver',
      accept: async () => {
        setMarkingAbsent(true);

        try {
          await marcarTurnoAusente(currentTurn.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Turno cancelado',
            detail: `El turno ${currentTurn.numeroTurno} fue marcado como ausente`,
          });
          fetchTurnos(false);
        } catch (e: unknown) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(e, 'No se pudo cancelar el turno por ausencia'),
          });
        } finally {
          setMarkingAbsent(false);
        }
      },
    });
  };

  return (
    <ScreenContainer activeLabel="Dashboard" onNavigate={onNavigate}>
      <Toast ref={toast} />
      <ConfirmDialog />

      <section className="staff-dashboard-layout">
        <div className="staff-main">
          <div className="staff-current-card">
            <div className="staff-current-top">
              <div>
                <span className="staff-badge">Turno llamado</span>
                <h2 className="staff-turn-number">{currentTurn?.numeroTurno || '-'}</h2>
                <p className="staff-turn-section">
                  {currentTurn?.seccionDescripcion || 'Sin turno llamado'}
                </p>
              </div>

              <div className="staff-wait-box">
                <p>En espera</p>
                <strong>{waitingTurns.length}</strong>
              </div>
            </div>

            <div className="staff-actions-grid">
              <Button
                label="LLAMAR SIGUIENTE"
                icon="pi pi-megaphone"
                className="staff-action-complete"
                type="button"
                disabled={!nextTurn}
                loading={!!nextTurn && callingId === nextTurn.id}
                onClick={() => handleCall(nextTurn)}
              />
              <Button
                label="RE-LLAMAR"
                icon="pi pi-megaphone"
                className="staff-action-light"
                type="button"
                disabled={!currentTurn}
                loading={!!currentTurn && callingId === currentTurn.id}
                onClick={() => handleCall(currentTurn)}
              />
              <Button
                label="NO SE PRESENTÓ"
                icon="pi pi-user-minus"
                className="staff-action-light"
                type="button"
                disabled={!currentTurn}
                loading={markingAbsent}
                onClick={handleMarkAbsent}
              />
              <Button
                label="LISTADO"
                icon="pi pi-list"
                className="staff-action-light"
                type="button"
                onClick={() => onNavigate?.('admin-turns')}
              />
              <Button
                label="PANTALLA"
                icon="pi pi-desktop"
                className="staff-action-light"
                type="button"
                onClick={() => onNavigate?.('queue')}
              />
            </div>
          </div>

          <div className="staff-call-next">
            <Button
              label={nextTurn ? `Llamar ${nextTurn.numeroTurno}` : 'No hay turnos en espera'}
              icon="pi pi-megaphone"
              iconPos="right"
              className="staff-call-next-button"
              type="button"
              disabled={!nextTurn}
              loading={!!nextTurn && callingId === nextTurn.id}
              onClick={() => handleCall(nextTurn)}
            />
          </div>

          <div className="staff-bottom-grid">
            <div className="staff-detail-card">
              <h3>Turno actual</h3>

              <div className="staff-person-row">
                <div className="staff-avatar">
                  <i className="pi pi-user" />
                </div>

                <div>
                  <strong>{currentTurn?.nombreCliente || '-'}</strong>
                  <p>ID: {currentTurn?.documentoCliente || '-'}</p>
                </div>
              </div>

              <div className="staff-detail-list">
                <div>
                  <span>Sección</span>
                  <strong>{currentTurn?.seccionDescripcion || '-'}</strong>
                </div>
                <div>
                  <span>Prioridad</span>
                  <strong>{currentTurn?.prioridadTurno || '-'}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <strong>{currentTurn?.estadoTurno || '-'}</strong>
                </div>
              </div>
            </div>

            <div className="staff-detail-card">
              <h3>Próximos turnos</h3>
              <DataTable
                value={waitingTurns}
                loading={loading}
                rows={5}
                emptyMessage="No hay turnos en espera"
                size="small"
              >
                <Column field="numeroTurno" header="Turno" style={{ width: 110 }} />
                <Column field="seccionDescripcion" header="Sección" />
                <Column field="prioridadTurno" header="Prioridad" style={{ width: 130 }} />
                <Column body={callActionTemplate} style={{ width: 80 }} />
              </DataTable>
            </div>
          </div>
        </div>
      </section>
    </ScreenContainer>
  );
}
