import { useRef } from 'react';
import { Lock, Move } from 'lucide-react';
import './MapillaryViewer.css';

interface Props {
  mapillaryId: string;
  energy: number;
  onMove: () => boolean; // returns false if no energy left
}

/**
 * Embeds the Mapillary street-level viewer.
 * MVP: uses an iframe pointing to mapillary.com/embed.
 * The viewer is interactive (pan/rotate free, navigation costs energy).
 *
 * NOTE: For full SDK integration with move interception,
 * we'll upgrade to @mapillary/mapillary-js in a later phase.
 * For now, the iframe approach gives us a working viewer immediately.
 */
export function MapillaryViewer({ mapillaryId, energy, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track navigation events (simplified for iframe MVP)
  const handleNavigate = () => {
    if (energy <= 0) return;
    onMove();
  };

  // The Mapillary embed URL
  const embedUrl = `https://www.mapillary.com/embed?image_key=${mapillaryId}&style=photo`;

  return (
    <div className="mapillary-viewer" ref={containerRef}>
      <div className="viewer-frame">
        <iframe
          src={embedUrl}
          title="Street view"
          className="viewer-iframe"
          allowFullScreen
        />

        {/* Energy overlay when depleted */}
        {energy <= 0 && (
          <div className="viewer-overlay viewer-overlay--locked">
            <Lock size={32} className="lock-icon" />
            <span className="overlay-text">Sin energia para moverse</span>
            <span className="overlay-hint mono">Rotacion libre disponible</span>
          </div>
        )}
      </div>

      {/* Move counter */}
      <div className="viewer-actions">
        <button
          className="action-btn action-btn--move"
          onClick={handleNavigate}
          disabled={energy <= 0}
        >
          <Move size={16} />
          <span>Moverse</span>
          <span className="mono action-cost">-1</span>
        </button>
      </div>
    </div>
  );
}
