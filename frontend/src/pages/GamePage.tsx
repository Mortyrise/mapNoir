import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { useResources } from '../hooks/useResources';
import { ResourceBar } from '../components/ResourceBar';
import { MapillaryViewer } from '../components/MapillaryViewer';
import { CluePanel } from '../components/CluePanel';
import './GamePage.css';

export function GamePage() {
  const navigate = useNavigate();
  const game = useGame();
  const { resources, consumeEnergy, startTimer, stopTimer, reset: resetResources } = useResources();

  // Start game on mount
  useEffect(() => {
    game.startGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start timer when playing
  useEffect(() => {
    if (game.state.phase === 'playing') {
      resetResources();
      startTimer();
    }
    if (game.state.phase === 'result' || game.state.phase === 'summary') {
      stopTimer();
    }
  }, [game.state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to home on summary (for now)
  useEffect(() => {
    if (game.state.phase === 'summary') {
      // TODO: Fase 5 -- SummaryPage
      navigate('/');
    }
  }, [game.state.phase, navigate]);

  if (game.state.phase === 'loading' || game.state.phase === 'idle') {
    return (
      <div className="game-loading">
        <Loader size={24} className="spin" />
        <span>Abriendo expediente...</span>
      </div>
    );
  }

  const round = game.currentRound;
  if (!round) return null;

  return (
    <div className="game-page">
      {/* Header: round info + resources */}
      <div className="game-header">
        <div className="round-indicator mono">
          RONDA {game.state.currentRoundIndex + 1}/{game.roundsPerGame}
        </div>
        <ResourceBar resources={resources} />
      </div>

      {/* Main: Mapillary viewer */}
      <div className="game-main">
        <MapillaryViewer
          mapillaryId={round.dto.mapillaryId}
          energy={resources.energy}
          onMove={consumeEnergy}
        />
      </div>

      {/* Bottom: Clues + Map (map comes in Fase 3) */}
      <div className="game-bottom">
        <CluePanel
          initialClues={round.dto.clues}
          extraClues={round.extraClues}
          onRequestClue={game.requestExtraClue}
          disabled={game.state.phase === 'result'}
        />

        {/* Map placeholder -- Fase 3 */}
        <div className="map-placeholder mono">
          Mapa de respuesta -- Fase 3
        </div>
      </div>
    </div>
  );
}
