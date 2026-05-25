import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AppTopbar from '../components/layout/AppTopbar';
import {
  anularTurno,
  llamarTurno,
  listarTurnos,
  modificarTurno,
  type ModificarTurnoPayload,
  type PrioridadTurno,
  type Turno,
} from '../services/turnosService';

type Props = {
  onNavigate?: (target: string) => void;
};

const priorityOptions: Array<{ label: string; value: PrioridadTurno }> = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Preferencial', value: 'PREFERENCIAL' },
  { label: 'VIP', value: 'VIP' },
  { label: 'Urgente', value: 'URGENTE' },
];

const statusOptions = [
  { label: 'En espera', value: 'EN_ESPERA' },
  { label: 'Llamado', value: 'LLAMADO' },
  { label: 'En atención', value: 'EN_ATENCION' },
  { label: 'Finalizado', value: 'FINALIZADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
  { label: 'Ausente', value: 'AUSENTE' },
];

const elapsedStatusOptions = [
  { label: 'Bueno', value: 'bueno' },
  { label: 'Normal', value: 'normal' },
  { label: 'Tiempo prudencial', value: 'tiempo prudencial' },
  { label: 'Tiempo excesivo', value: 'tiempo excesivo' },
];

type TurnoFilterState = {
  search: string;
  estadoTurno: string | null;
  prioridadTurno: PrioridadTurno | null;
  estadoTiempo: string | null;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatDateTime(value?: string) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-PY', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusColor(status: string) {
  if (status === 'EN_ESPERA') {
    return { background: '#dbeafe', color: '#1e40af' };
  }

  if (status === 'LLAMADO' || status === 'EN_ATENCION') {
    return { background: '#fef3c7', color: '#92400e' };
  }

  if (status === 'FINALIZADO') {
    return { background: '#dcfce7', color: '#166534' };
  }

  if (status === 'CANCELADO' || status === 'AUSENTE') {
    return { background: '#fee2e2', color: '#991b1b' };
  }

  return { background: '#f1f5f9', color: '#334155' };
}

function getPriorityColor(priority: string) {
  if (priority === 'URGENTE') {
    return { background: '#fee2e2', color: '#991b1b' };
  }

  if (priority === 'VIP') {
    return { background: '#fef3c7', color: '#92400e' };
  }

  if (priority === 'PREFERENCIAL') {
    return { background: '#ede9fe', color: '#5b21b6' };
  }

  return { background: '#dcfce7', color: '#166534' };
}

function formatElapsedTime(value: string | undefined, referenceDate: Date) {
  if (!value) {
    return '-';
  }

  const createdAt = new Date(value);
  const diffMs = referenceDate.getTime() - createdAt.getTime();

  if (Number.isNaN(createdAt.getTime()) || diffMs < 0) {
    return '-';
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min ${seconds} s`;
  }

  return `${minutes} min ${seconds} s`;
}

function getElapsedMinutes(value: string | undefined, referenceDate: Date) {
  if (!value) {
    return null;
  }

  const createdAt = new Date(value);
  const diffMs = referenceDate.getTime() - createdAt.getTime();

  if (Number.isNaN(createdAt.getTime()) || diffMs < 0) {
    return null;
  }

  return Math.floor(diffMs / 60000);
}

function getElapsedStatus(minutes: number | null) {
  if (minutes === null) {
    return { label: '-', background: '#f8fafc', color: '#334155', border: '#cbd5e1' };
  }

  if (minutes <= 5) {
    return { label: 'bueno', background: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
  }

  if (minutes <= 15) {
    return { label: 'normal', background: '#dcfce7', color: '#166534', border: '#86efac' };
  }

  if (minutes <= 30) {
    return { label: 'tiempo prudencial', background: '#ffedd5', color: '#9a3412', border: '#fdba74' };
  }

  return { label: 'tiempo excesivo', background: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
}

export default function TurnosScreen({ onNavigate }: Props) {
  const toast = useRef<Toast>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Turno | null>(null);
  const [editForm, setEditForm] = useState<ModificarTurnoPayload>({});
  const [filters, setFilters] = useState<TurnoFilterState>({
    search: '',
    estadoTurno: null,
    prioridadTurno: null,
    estadoTiempo: null,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const tableTurnos = useMemo(() => {
    const elapsedTick = currentTime.getTime();

    return turnos.map((turno) => ({
      ...turno,
      elapsedTick,
    }));
  }, [currentTime, turnos]);
  const filteredTurnos = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return tableTurnos.filter((turno) => {
      const elapsedStatus = getElapsedStatus(getElapsedMinutes(turno.fechaHoraEmision, currentTime)).label;
      const matchesSearch =
        !search ||
        [
          turno.numeroTurno,
          turno.seccionDescripcion,
          turno.nombreCliente,
          turno.documentoCliente,
          turno.estadoTurno,
          turno.prioridadTurno,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesStatus = !filters.estadoTurno || turno.estadoTurno === filters.estadoTurno;
      const matchesPriority = !filters.prioridadTurno || turno.prioridadTurno === filters.prioridadTurno;
      const matchesElapsedStatus = !filters.estadoTiempo || elapsedStatus === filters.estadoTiempo;

      return matchesSearch && matchesStatus && matchesPriority && matchesElapsedStatus;
    });
  }, [currentTime, filters, tableTurnos]);

  const fetchTurnos = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await listarTurnos();
      setTurnos(data);
      setCurrentTime(new Date());
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const statusTemplate = (row: Turno) => {
    const colors = getStatusColor(row.estadoTurno);

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px',
          borderRadius: 999,
          background: colors.background,
          color: colors.color,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {row.estadoTurno.replaceAll('_', ' ')}
      </span>
    );
  };

  const priorityTemplate = (row: Turno) => {
    const colors = getPriorityColor(row.prioridadTurno);

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px',
          borderRadius: 999,
          background: colors.background,
          color: colors.color,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {row.prioridadTurno}
      </span>
    );
  };

  const emissionTemplate = (row: Turno) => (
    <span>{formatDateTime(row.fechaHoraEmision)}</span>
  );

  const elapsedTemplate = (row: Turno) => (
    <span>{formatElapsedTime(row.fechaHoraEmision, currentTime)}</span>
  );

  const elapsedStatusTemplate = (row: Turno) => {
    const status = getElapsedStatus(getElapsedMinutes(row.fechaHoraEmision, currentTime));

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px',
          borderRadius: 999,
          background: status.background,
          color: status.color,
          border: `1px solid ${status.border}`,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        {status.label}
      </span>
    );
  };

  const openEdit = (turno: Turno) => {
    setEditTarget(turno);
    setEditForm({
      prioridadTurno: turno.prioridadTurno,
      nombreCliente: turno.nombreCliente || '',
      documentoCliente: turno.documentoCliente || '',
      observacion: turno.observacion || '',
    });
    setEditDialogVisible(true);
  };

  const closeEdit = () => {
    setEditDialogVisible(false);
    setEditTarget(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editTarget) {
      return;
    }

    setSaving(true);

    try {
      await modificarTurno(editTarget.id, editForm);
      toast.current?.show({ severity: 'success', summary: 'Guardado', detail: 'Turno modificado' });
      closeEdit();
      fetchTurnos(false);
    } catch (e: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(e, 'No se pudo modificar el turno'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCall = async (turno: Turno) => {
    try {
      await llamarTurno(turno.id);
      toast.current?.show({ severity: 'success', summary: 'Llamado', detail: `Turno ${turno.numeroTurno} llamado` });
      fetchTurnos(false);
    } catch (e: unknown) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(e, 'No se pudo llamar el turno'),
      });
    }
  };

  const handleCancel = (turno: Turno) => {
    confirmDialog({
      message: `¿Anular el turno ${turno.numeroTurno}?`,
      header: 'Confirmar anulación',
      icon: 'pi pi-ban',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await anularTurno(turno.id);
          toast.current?.show({ severity: 'success', summary: 'Anulado', detail: `Turno ${turno.numeroTurno} anulado` });
          fetchTurnos(false);
        } catch (e: unknown) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(e, 'No se pudo anular el turno'),
          });
        }
      },
    });
  };

  const actionsTemplate = (row: Turno) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <Button icon="pi pi-pencil" rounded text severity="secondary" tooltip="Modificar" onClick={() => openEdit(row)} />
      <Button icon="pi pi-ban" rounded text severity="danger" tooltip="Anular" onClick={() => handleCancel(row)} />
      <Button icon="pi pi-megaphone" rounded text severity="success" tooltip="Llamar" onClick={() => handleCall(row)} />
    </div>
  );

  const clearFilters = () => {
    setFilters({
      search: '',
      estadoTurno: null,
      prioridadTurno: null,
      estadoTiempo: null,
    });
  };

  const editDialogFooter = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Button label="Cancelar" icon="pi pi-times" className="back-home-button" onClick={closeEdit} disabled={saving} />
      <Button label="Guardar" icon="pi pi-check" className="staff-call-next-button" onClick={handleSaveEdit} loading={saving} />
    </div>
  );

  return (
    <div className="app-shell">
      <AppTopbar activeLabel="Configuraciones" onNavigate={onNavigate} />

      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="screen-main" style={{ width: 'min(1600px, calc(100vw - 80px))', maxWidth: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div className="step-pill">Configuración</div>
            <h2 className="section-title">Turnos</h2>
            <p className="section-subtitle">Consultá los turnos generados en el sistema.</p>
          </div>

          <Button
            label="Actualizar"
            icon="pi pi-refresh"
            onClick={() => fetchTurnos()}
            loading={loading}
            style={{
              border: 'none',
              borderRadius: 18,
              padding: '14px 22px',
              background: 'linear-gradient(135deg, var(--app-primary), var(--app-primary-2))',
              fontWeight: 800,
            }}
          />
        </div>

        <div
          className="screen-card"
          style={{ padding: 16, overflow: 'hidden', width: '100%', marginBottom: 16 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 1.3fr) repeat(3, minmax(180px, 1fr)) auto',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <label>
              <span className="field-label">Buscar</span>
              <InputText
                value={filters.search}
                onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
                placeholder="Turno, sección, cliente, documento..."
                style={{ width: '100%', marginTop: 6 }}
              />
            </label>

            <label>
              <span className="field-label">Estado</span>
              <Dropdown
                value={filters.estadoTurno}
                options={statusOptions}
                onChange={(e) => setFilters((current) => ({ ...current, estadoTurno: e.value }))}
                placeholder="Todos"
                showClear
                style={{ width: '100%', marginTop: 6 }}
              />
            </label>

            <label>
              <span className="field-label">Prioridad</span>
              <Dropdown
                value={filters.prioridadTurno}
                options={priorityOptions}
                onChange={(e) => setFilters((current) => ({ ...current, prioridadTurno: e.value }))}
                placeholder="Todas"
                showClear
                style={{ width: '100%', marginTop: 6 }}
              />
            </label>

            <label>
              <span className="field-label">Estado tiempo</span>
              <Dropdown
                value={filters.estadoTiempo}
                options={elapsedStatusOptions}
                onChange={(e) => setFilters((current) => ({ ...current, estadoTiempo: e.value }))}
                placeholder="Todos"
                showClear
                style={{ width: '100%', marginTop: 6 }}
              />
            </label>

            <Button
              icon="pi pi-filter-slash"
              type="button"
              className="p-button-text"
              onClick={clearFilters}
              tooltip="Limpiar filtros"
            />
          </div>
        </div>

        <div className="screen-card" style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
          <DataTable
            value={filteredTurnos}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            emptyMessage="No hay turnos registrados"
            style={{ borderRadius: 24 }}
          >
            <Column field="numeroTurno" header="Turno" sortable style={{ width: 130 }} />
            <Column field="seccionDescripcion" header="Sección" sortable />
            <Column field="nombreCliente" header="Cliente" sortable />
            <Column field="documentoCliente" header="Documento" sortable style={{ width: 150 }} />
            <Column header="Prioridad" body={priorityTemplate} sortable style={{ width: 150 }} />
            <Column header="Estado" body={statusTemplate} sortable style={{ width: 170 }} />
            <Column header="Transcurrido" body={elapsedTemplate} sortable style={{ width: 150 }} />
            <Column header="Estado tiempo" body={elapsedStatusTemplate} sortable style={{ width: 190 }} />
            <Column header="Emisión" body={emissionTemplate} sortable style={{ width: 170 }} />
            <Column header="Acciones" body={actionsTemplate} style={{ width: 150 }} />
          </DataTable>
        </div>
      </div>

      <Dialog
        visible={editDialogVisible}
        onHide={closeEdit}
        header={editTarget ? `Modificar turno ${editTarget.numeroTurno}` : 'Modificar turno'}
        footer={editDialogFooter}
        style={{ width: 520 }}
        modal
        draggable={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
          <div>
            <label className="field-label">Prioridad</label>
            <Dropdown
              value={editForm.prioridadTurno}
              options={priorityOptions}
              onChange={(e) => setEditForm((form) => ({ ...form, prioridadTurno: e.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="field-label">Cliente</label>
            <InputText
              value={editForm.nombreCliente || ''}
              onChange={(e) => setEditForm((form) => ({ ...form, nombreCliente: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="field-label">Documento</label>
            <InputText
              value={editForm.documentoCliente || ''}
              onChange={(e) => setEditForm((form) => ({ ...form, documentoCliente: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="field-label">Observación</label>
            <InputText
              value={editForm.observacion || ''}
              onChange={(e) => setEditForm((form) => ({ ...form, observacion: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
