export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  variant?: 'primary' | 'light' | 'cyan';
  badge?: string;
};

export type QueueServiceOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent?: 'default' | 'cyan';
};

export const welcomeServices: ServiceItem[] = [
  {
    id: 'caja',
    title: 'Caja',
    description: 'Pagos, depósitos y transacciones en ventanilla.',
    icon: 'pi pi-wallet',
    variant: 'light',
  },
  {
    id: 'atencion',
    title: 'Atención al Cliente',
    description: 'Consultas, reclamos y asesoría personalizada.',
    icon: 'pi pi-users',
    variant: 'primary',
  },
  {
    id: 'entregas',
    title: 'Entregas',
    description: 'Retiro de documentos, paquetes y encomiendas.',
    icon: 'pi pi-send',
    variant: 'light',
  },
];

export const categorySections: ServiceItem[] = [
  {
    id: 'caja',
    title: 'Caja',
    description: 'Pagos, cobros y transacciones financieras inmediatas.',
    icon: 'pi pi-wallet',
    variant: 'primary',
    badge: 'Fast Track',
  },
  {
    id: 'atencion',
    title: 'Atención al Cliente',
    description: 'Consultas personalizadas, reclamos y asesoramiento general.',
    icon: 'pi pi-users',
    variant: 'light',
  },
  {
    id: 'entregas',
    title: 'Entregas',
    description: 'Retiro de pedidos, documentación física y encomiendas.',
    icon: 'pi pi-inbox',
    variant: 'light',
  },
  {
    id: 'tramites-rapidos',
    title: 'Trámites Rápidos',
    description: 'Certificados, sellados y validaciones que toman menos de 5 minutos.',
    icon: 'pi pi-bolt',
    variant: 'cyan',
    badge: 'Bajo Tiempo de Espera',
  },
];

export const serviceSelectionOptions: QueueServiceOption[] = [
  {
    id: 'firma-f1',
    title: 'Firma F1',
    description: 'Validación de documentos oficiales',
    icon: 'pi pi-file-edit',
  },
  {
    id: 'firma-f2',
    title: 'Firma F2',
    description: 'Autenticación de identidad digital',
    icon: 'pi pi-verified',
  },
  {
    id: 'firma-f3',
    title: 'Firma F3',
    description: 'Certificación de firmas notariales',
    icon: 'pi pi-pencil',
  },
  {
    id: 'otras',
    title: 'Otras Gestiones',
    description: 'Trámites generales y consultas',
    icon: 'pi pi-ellipsis-h',
    accent: 'cyan',
  },
];

export type PersonRecord = {
  documento: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
};

export const personRecords: PersonRecord[] = [
  {
    documento: '4112669',
    nombre: 'Juan Carlos',
    apellido: 'Gómez',
    telefono: '0981 123456',
    email: 'juan.gomez@mail.com',
    direccion: 'Asunción',
  },
  {
    documento: '12345678',
    nombre: 'María Elena',
    apellido: 'Benítez',
    telefono: '0972 654321',
    email: 'maria.benitez@mail.com',
    direccion: 'San Lorenzo',
  },
  {
    documento: '87654321',
    nombre: 'Pedro Luis',
    apellido: 'Ramírez',
    telefono: '0991 777888',
    email: 'pedro.ramirez@mail.com',
    direccion: 'Luque',
  },
];