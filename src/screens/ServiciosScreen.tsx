import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import {
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  type Servicio,
  type ServicioPayload,
} from '../services/serviciosService';
import AppTopbar from '../components/layout/AppTopbar';

type Props = {
  onNavigate?: (target: string) => void;
};

const emptyForm: ServicioPayload = { codigo: '', descripcion: '' };

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ServiciosScreen({ onNavigate }: Props) {
  const toast = useRef<Toast>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Servicio | null>(null);
  const [form, setForm] = useState<ServicioPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const data = await listarServicios();
      setServicios(data);
    } catch (e: unknown) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: getErrorMessage(e, 'No se pudieron cargar los servicios') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServicios(); }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogVisible(true);
  };

  const openEdit = (servicio: Servicio) => {
    setEditTarget(servicio);
    setForm({ codigo: servicio.codigo, descripcion: servicio.descripcion });
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.descripcion.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Validación', detail: 'La descripción es requerida' });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await actualizarServicio(editTarget.id, form);
      } else {
        await crearServicio(form);
      }
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: editTarget ? 'Servicio actualizado' : 'Servicio creado',
      });
      closeDialog();
      fetchServicios();
    } catch (e: unknown) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: getErrorMessage(e, 'No se pudo guardar el servicio') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (servicio: Servicio) => {
    confirmDialog({
      message: `¿Eliminar el servicio "${servicio.descripcion}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await eliminarServicio(servicio.id);
          toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Servicio eliminado' });
          fetchServicios();
        } catch (e: unknown) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: getErrorMessage(e, 'No se pudo eliminar el servicio') });
        }
      },
    });
  };

  const actionsTemplate = (row: Servicio) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(row)} />
    </div>
  );

  const dialogFooter = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Button label="Cancelar" icon="pi pi-times" className="back-home-button" onClick={closeDialog} disabled={saving} />
      <Button label={editTarget ? 'Actualizar' : 'Crear'} icon="pi pi-check" className="staff-call-next-button" onClick={handleSave} loading={saving} />
    </div>
  );

  return (
    <div className="app-shell">
      <AppTopbar
        activeLabel="Configuraciones"
        onNavigate={onNavigate}
      />

      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="screen-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div className="step-pill">Configuración</div>
            <h2 className="section-title">Servicios</h2>
            <p className="section-subtitle">Administrá los servicios disponibles del sistema.</p>
          </div>
          <Button
            label="Nuevo servicio"
            icon="pi pi-plus"
            onClick={openNew}
            style={{
              border: 'none',
              borderRadius: 18,
              padding: '14px 22px',
              background: 'linear-gradient(135deg, var(--app-primary), var(--app-primary-2))',
              fontWeight: 800,
            }}
          />
        </div>

        <div className="screen-card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable
            value={servicios}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            emptyMessage="No hay servicios registrados"
            style={{ borderRadius: 24 }}
          >
            <Column field="codigo" header="Código" sortable style={{ width: 140 }} />
            <Column field="descripcion" header="Descripción" sortable />
            <Column body={actionsTemplate} style={{ width: 100, textAlign: 'right' }} />
          </DataTable>
        </div>
      </div>

      <Dialog
        visible={dialogVisible}
        onHide={closeDialog}
        header={editTarget ? 'Editar servicio' : 'Nuevo servicio'}
        footer={dialogFooter}
        style={{ width: 480 }}
        modal
        draggable={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
          <div>
            <label className="field-label">Código</label>
            <InputText
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              placeholder="Ej: FIN, RR.HH."
              maxLength={10}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="field-label">
              Descripción <span style={{ color: 'var(--app-cyan)' }}>*</span>
            </label>
            <InputText
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Nombre del servicio"
              maxLength={150}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
