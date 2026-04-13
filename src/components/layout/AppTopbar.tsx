type AppTopbarProps = {
  activeLabel?: string;
  showLanguage?: boolean;
  onNavigate?: (target: string) => void;
};

export default function AppTopbar({
  activeLabel = 'Servicios',
  showLanguage = true,
  onNavigate,
}: AppTopbarProps) {
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
        </nav>

        {showLanguage && <div className="lang-pill">EN</div>}
      </div>
    </header>
  );
}