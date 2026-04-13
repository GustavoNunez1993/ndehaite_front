import { useState, type FormEvent } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

type Props = {
  onNavigate?: (target: string) => void;
};

export default function LoginPage({ onNavigate }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNavigate?.('dashboard');
  };

  return (
    <div className="login-page">
      <main className="login-page-center">
        <section className="login-page-panel screen-card">
          <div className="login-page-brand">
            <div className="app-brand-icon">
              <i className="pi pi-th-large" />
            </div>
            <div className="app-brand-title">Grupo BEPA S.A</div>
          </div>

          <div className="login-page-panel-head login-page-panel-head-center">
            <div className="login-page-kicker">Portal interno</div>
            <h1 className="login-page-title-small">Acceso de usuario</h1>
            <p>Ingrese sus credenciales para abrir la sesión.</p>
          </div>

          <form className="login-page-form" onSubmit={handleSubmit}>
            <label className="login-page-field">
              <span className="field-label">Usuario</span>
              <div className="login-page-input-wrap">
                <i className="pi pi-user login-page-input-icon" />
                <InputText
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nombre de usuario"
                  className="login-page-input"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="login-page-field">
              <span className="field-label">Contraseña</span>
              <div className="login-page-input-wrap">
                <i className="pi pi-key login-page-input-icon" />
                <InputText
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingrese su contraseña"
                  type="password"
                  className="login-page-input"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <div className="login-page-options">
              <label className="login-page-remember">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>

              <button type="button" className="login-page-link" onClick={() => onNavigate?.('queue')}>
                Volver
              </button>
            </div>

            <Button
              label="Ingresar"
              icon="pi pi-sign-in"
              iconPos="right"
              type="submit"
              className="login-page-submit"
            />
          </form>
        </section>
      </main>
    </div>
  );
}
