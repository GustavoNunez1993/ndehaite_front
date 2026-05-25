import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import ScreenContainer from '../components/layout/ScreenContainer';
import { listarSecciones, type Seccion } from '../services/seccionesService';
import {
  crearTurno,
  listarTurnosPorSeccionYFecha,
  type Turno,
} from '../services/turnosService';
import { showError } from '../utils/notify';

type Props = {
  onNavigate?: (target: string) => void;
  personName?: string;
  documentNumber?: string;
  onTicketCreated?: (ticket: Turno) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getIconByIndex(index: number) {
  const icons = [
    'pi pi-wallet',
    'pi pi-users',
    'pi pi-send',
    'pi pi-file',
    'pi pi-credit-card',
    'pi pi-briefcase',
  ];

  return icons[index % icons.length];
}

function normalizePrefix(value: string) {
  return value.trim().toUpperCase() || 'T';
}

function getTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function getNextSequence(seccionId: string) {
  const turnos = await listarTurnosPorSeccionYFecha(seccionId, getTodayValue());
  const maxSequence = turnos.reduce((max, turno) => {
    return Math.max(max, turno.numeroSecuencia || 0);
  }, 0);

  return maxSequence + 1;
}

export default function WelcomeScreen({
  onNavigate,
  personName,
  documentNumber,
  onTicketCreated,
}: Props) {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSeccionId, setLoadingSeccionId] = useState<string | null>(null);

  const cargarSecciones = async () => {
    setLoading(true);

    try {
      console.log('WelcomeScreen: cargando secciones');

      const data = await listarSecciones();

      console.log('WelcomeScreen: secciones cargadas', data);

      setSecciones(data);
    } catch (e: unknown) {
      console.error('WelcomeScreen: error al cargar secciones', e);

      showError(
        'Error',
        getErrorMessage(e, 'No se pudieron cargar las secciones')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  const handleStart = async (seccion: Seccion) => {
    setLoadingSeccionId(seccion.id);

    if (seccion.tieneServicios) {
      onNavigate?.(`category/${seccion.id}`);
      setLoadingSeccionId(null);
      return;
    }

    try {
      const prefijo = normalizePrefix(seccion.codigo);
      const numeroSecuencia = await getNextSequence(seccion.id);
      const numeroTurno = `${prefijo}-${String(numeroSecuencia).padStart(3, '0')}`;

      const ticket = await crearTurno({
        numeroTurno,
        prefijo,
        numeroSecuencia,
        seccionId: seccion.id,
        prioridadTurno: 'NORMAL',
        nombreCliente: personName,
        documentoCliente: documentNumber,
      });

      onTicketCreated?.(ticket);
      onNavigate?.('ticket');
    } catch (e: unknown) {
      showError(
        'Error',
        getErrorMessage(e, 'No se pudo generar el ticket de espera')
      );
    } finally {
      setLoadingSeccionId(null);
    }
  };

  return (
    <ScreenContainer activeLabel="Home" onNavigate={onNavigate}>
      <section className="hero-block">
        <h1 className="hero-title">
          Bienvenido
          <br />
          {personName ? ` ${personName}` : ''}
          <br />
          <span>por favor seleccione su trámite</span>
        </h1>

        <p className="hero-subtitle">
          Estamos aquí para ayudarle a agilizar su visita. Seleccione una categoría para comenzar.
        </p>
      </section>

      <section className="welcome-grid">
        {loading && secciones.length === 0 && (
          <article className="service-card service-card-light">
            <div className="service-content">
              <h3>Cargando...</h3>
              <p>Estamos obteniendo las secciones disponibles.</p>
            </div>
          </article>
        )}

        {!loading && secciones.length === 0 && (
          <article className="service-card service-card-light">
            <div className="service-content">
              <h3>Sin secciones</h3>
              <p>No hay secciones disponibles para iniciar un trámite.</p>
            </div>
          </article>
        )}

        {secciones.map((item, index) => {
          const isPrimary = index === 1;

          return (
            <article
              key={item.id}
              className={`service-card ${isPrimary ? 'service-card-primary' : 'service-card-light'
                }`}
            >
              <div className="service-icon">
                <i className={getIconByIndex(index)} />
              </div>

              <div className="service-content">
                <h3>{item.descripcion}</h3>

                <p>
                  Código: {item.codigo}
                </p>
              </div>

              <Button
                label="Comenzar"
                icon="pi pi-arrow-right"
                iconPos="right"
                className="p-button-text service-action"
                type="button"
                onClick={() => handleStart(item)}
                loading={loadingSeccionId === item.id}
              />
            </article>
          );
        })}
      </section>
    </ScreenContainer>
  );
}
