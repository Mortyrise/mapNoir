import { useNavigate } from 'react-router-dom';
import { Crosshair, MapPin } from 'lucide-react';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-content">
        <div className="home-badge mono">CASE FILE // CLASSIFIED</div>

        <h1 className="home-title">
          <span className="title-line">Map</span>
          <span className="title-line title-accent">Noir</span>
        </h1>

        <p className="home-subtitle">Last Known Location</p>

        <div className="home-divider" />

        <p className="home-description">
          Un testigo situa al sospechoso en alguna parte de Europa.
          Observa la escena. Interpreta las pistas.
          Decide donde crees que estas.
        </p>

        <button
          className="home-start-btn"
          onClick={() => navigate('/play')}
        >
          <Crosshair size={18} />
          <span>Abrir caso</span>
        </button>

        <div className="home-footer">
          <MapPin size={12} />
          <span className="mono">5 rondas por caso // Europa</span>
        </div>
      </div>
    </div>
  );
}
