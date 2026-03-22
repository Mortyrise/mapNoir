import { useState } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { ClueDTO } from '../lib/api';
import './CluePanel.css';

interface Props {
  initialClues: ClueDTO[];
  extraClues: ClueDTO[];
  onRequestClue: () => Promise<ClueDTO | null>;
  disabled?: boolean;
}

export function CluePanel({ initialClues, extraClues, onRequestClue, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const allClues = [...initialClues, ...extraClues];

  const handleRequestClue = async () => {
    setLoading(true);
    await onRequestClue();
    setLoading(false);
  };

  return (
    <div className={`clue-panel ${expanded ? '' : 'clue-panel--collapsed'}`}>
      <button
        className="clue-header"
        onClick={() => setExpanded(!expanded)}
      >
        <FileText size={16} className="clue-header-icon" />
        <span className="clue-header-title">Expediente del caso</span>
        <span className="mono clue-count">{allClues.length}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="clue-body">
          <ul className="clue-list">
            {allClues.map((clue, i) => (
              <li
                key={i}
                className={`clue-item ${i >= initialClues.length ? 'clue-item--extra' : ''}`}
              >
                <span className="clue-bullet">{String(i + 1).padStart(2, '0')}</span>
                <span className="clue-text">{clue.text}</span>
              </li>
            ))}
          </ul>

          <button
            className="action-btn clue-request-btn"
            onClick={handleRequestClue}
            disabled={disabled || loading}
          >
            <Plus size={14} />
            <span>{loading ? 'Buscando...' : 'Pedir pista'}</span>
            <span className="mono action-cost">-15%</span>
          </button>
        </div>
      )}
    </div>
  );
}
