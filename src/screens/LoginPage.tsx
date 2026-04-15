import { useState, type FormEvent } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { signin } from '../services/authService';
import { saveSession } from '../services/authStorage';

type Props = {
  onNavigate?: (target: string) => void;
};

export default function LoginPage({ onNavigate }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Debe completar usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);

      const response = await signin({
        username,
        password,
      });

      saveSession(response.accessToken, response.refreshToken);

      onNavigate?.('dashboard');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error al iniciar sesión.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </label>

            {errorMessage && (
              <small style={{ color: '#dc2626', display: 'block', marginTop: '-0.5rem' }}>
                {errorMessage}
              </small>
            )}

            <div className="login-page-options">
              <label className="login-page-remember">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                className="login-page-link"
                onClick={() => onNavigate?.('queue')}
                disabled={loading}
              >
                Volver
              </button>
            </div>

            <Button
              label={loading ? 'Ingresando...' : 'Ingresar'}
              icon="pi pi-sign-in"
              iconPos="right"
              type="submit"
              className="login-page-submit"
              loading={loading}
            />
          </form>
        </section>
      </main>
    </div>
  );
}