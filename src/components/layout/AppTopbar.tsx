import { useState, useRef, useEffect } from 'react';

type AppTopbarProps = {
  activeLabel?: string;
  showLanguage?: boolean;
  onNavigate?: (target: string) => void;
};

const configOptions = [
  { label: 'Perfil', value: 'profile', icon: 'pi pi-user' },
  { label: 'Preferencias', value: 'preferences', icon: 'pi pi-sliders-h' },
  {label: 'Secciones', value: 'sections', icon: 'pi pi-list' },
  { label: 'Cerrar sesión', value: 'login', icon: 'pi pi-sign-out' },
];

export default function AppTopbar({
  activeLabel = 'Servicios',
  showLanguage = true,
  onNavigate,
}: AppTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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
            onClick={() => onNavigate?.('welcome')}
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

          {/* Dropdown Configuraciones */}
          <div className="app-nav-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={dropdownOpen ? 'app-nav-item active' : 'app-nav-item'}
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              Configuraciones
              <i className={`pi ${dropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'} app-nav-chevron`} />
            </button>

            {dropdownOpen && (
              <div className="app-nav-dropdown-menu">
                {configOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="app-nav-dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
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