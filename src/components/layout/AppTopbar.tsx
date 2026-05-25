import { useState, useRef, useEffect } from 'react';

type AppTopbarProps = {
  activeLabel?: string;
  showLanguage?: boolean;
  onNavigate?: (target: string) => void;
};

const configOptions = [
  { label: 'Perfil', value: 'profile', icon: 'pi pi-user' },
  { label: 'Preferencias', value: 'preferences', icon: 'pi pi-sliders-h' },
  { label: 'Secciones', value: 'sections', icon: 'pi pi-list' },
  { label: 'Servicios', value: 'admin-services', icon: 'pi pi-briefcase' },
  { label: 'Cerrar sesión', value: 'login', icon: 'pi pi-sign-out' },
];

const turnOptions = [
  { label: 'Llamador funcionario', value: 'dashboard', icon: 'pi pi-megaphone' },
  { label: 'Listado de turnos', value: 'admin-turns', icon: 'pi pi-ticket' },
];

export default function AppTopbar({
  activeLabel = 'Servicios',
  showLanguage = true,
  onNavigate,
}: AppTopbarProps) {
  const [configDropdownOpen, setConfigDropdownOpen] = useState(false);
  const [turnDropdownOpen, setTurnDropdownOpen] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);
  const turnDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (configDropdownRef.current && !configDropdownRef.current.contains(e.target as Node)) {
        setConfigDropdownOpen(false);
      }

      if (turnDropdownRef.current && !turnDropdownRef.current.contains(e.target as Node)) {
        setTurnDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-topbar glass-topbar">
      <div className="app-brand">
        <div className="app-brand-icon">
          <i className="pi pi-th-large" />
        </div>
        <div>
          <div className="app-brand-title">Grupo BEPA S.A</div>
        </div>
      </div>

      <div className="app-topbar-right">
        <nav className="app-nav desktop-only">
          <button
            type="button"
            className={activeLabel === 'Home' ? 'app-nav-item active' : 'app-nav-item'}
            onClick={() => onNavigate?.('identification')}
          >
            Home
          </button>

          <button
            type="button"
            className={activeLabel === 'Servicios' ? 'app-nav-item active' : 'app-nav-item'}
            onClick={() => onNavigate?.('services')}
          >
            Servicios
          </button>

          <button
            type="button"
            className={activeLabel === 'Información' ? 'app-nav-item active' : 'app-nav-item'}
            onClick={() => onNavigate?.('queue')}
          >
            Información
          </button>

          <div className="app-nav-dropdown" ref={turnDropdownRef}>
            <button
              type="button"
              className={turnDropdownOpen ? 'app-nav-item active' : 'app-nav-item'}
              onClick={() => {
                setTurnDropdownOpen((prev) => !prev);
                setConfigDropdownOpen(false);
              }}
            >
              Administración de turnos
              <i className={`pi ${turnDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'} app-nav-chevron`} />
            </button>

            {turnDropdownOpen && (
              <div className="app-nav-dropdown-menu">
                {turnOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="app-nav-dropdown-item"
                    onClick={() => {
                      setTurnDropdownOpen(false);
                      onNavigate?.(opt.value);
                    }}
                  >
                    <i className={`${opt.icon} app-nav-dropdown-icon`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Configuraciones */}
          <div className="app-nav-dropdown" ref={configDropdownRef}>
            <button
              type="button"
              className={configDropdownOpen ? 'app-nav-item active' : 'app-nav-item'}
              onClick={() => {
                setConfigDropdownOpen((prev) => !prev);
                setTurnDropdownOpen(false);
              }}
            >
              Configuraciones
              <i className={`pi ${configDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'} app-nav-chevron`} />
            </button>

            {configDropdownOpen && (
              <div className="app-nav-dropdown-menu">
                {configOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="app-nav-dropdown-item"
                    onClick={() => {
                      setConfigDropdownOpen(false);
                      onNavigate?.(opt.value);
                    }}
                  >
                    <i className={`${opt.icon} app-nav-dropdown-icon`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {showLanguage && <div className="lang-pill">EN</div>}
      </div>
    </header>
  );
}
