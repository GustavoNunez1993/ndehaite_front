import { Button } from 'primereact/button';
import { welcomeServices } from '../data/mockData';
import ScreenContainer from '../components/layout/ScreenContainer';

type Props = {
  onNavigate?: (target: string) => void;
};

export default function WelcomeScreen({ onNavigate }: Props) {
  return (
    <ScreenContainer activeLabel="Home" onNavigate={onNavigate}>
      <section className="hero-block">
        <h1 className="hero-title">
          Bienvenido,
          <br />
          <span>por favor seleccione su trámite</span>
        </h1>

        <p className="hero-subtitle">
          Estamos aquí para ayudarle a agilizar su visita. Seleccione una categoría para comenzar.
        </p>
      </section>

      <section className="welcome-grid">
        {welcomeServices.map((item) => (
          <article
            key={item.id}
            className={`service-card ${
              item.variant === 'primary' ? 'service-card-primary' : 'service-card-light'
            }`}
          >
            <div className="service-icon">
              <i className={item.icon} />
            </div>

            <div className="service-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>

            <Button
              label="Comenzar"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="p-button-text service-action"
              type="button"
              onClick={() => onNavigate?.('category')}
            />
          </article>
        ))}
      </section>
    </ScreenContainer>
  );
}