import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { categorySections } from '../data/mockData';
import ScreenContainer from '../components/layout/ScreenContainer';

type Props = {
  onNavigate?: (target: string) => void;
};

export default function CategoryScreen({ onNavigate }: Props) {
  return (
    <ScreenContainer activeLabel="Servicios" onNavigate={onNavigate}>
      <section className="hero-block compact">
        <h2 className="hero-title small">Seleccione la sección</h2>
        <p className="hero-subtitle wide">Hola [Nombre/DNI], ¿en qué área desea ser atendido?</p>
      </section>

      <section className="category-grid">
        {categorySections.map((item) => {
          const large = item.id === 'caja' || item.id === 'tramites-rapidos';

          return (
            <article
              key={item.id}
              className={[
                'category-card',
                large ? 'category-card-large' : '',
                item.variant === 'primary' ? 'category-card-primary' : '',
                item.variant === 'cyan' ? 'category-card-cyan' : '',
                item.variant === 'light' ? 'category-card-light' : '',
              ].join(' ')}
            >
              <div className="category-card-top">
                <div className="category-icon">
                  <i className={item.icon} />
                </div>

                {item.badge && <Tag value={item.badge} className="category-tag" />}
              </div>

              <div className="category-card-body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <div className="category-card-footer">
                <Button
                  label="Seleccionar"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  className="p-button-text category-action"
                  type="button"
                  onClick={() => onNavigate?.('identification')}
                />
              </div>
            </article>
          );
        })}
      </section>
    </ScreenContainer>
  );
}