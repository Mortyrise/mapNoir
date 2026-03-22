import { Zap, Clock, AlertTriangle } from 'lucide-react';
import type { Resources } from '../hooks/useResources';
import './ResourceBar.css';

interface Props {
  resources: Resources;
}

export function ResourceBar({ resources }: Props) {
  const { energy, maxEnergy, timeLeft, isOvertime } = resources;
  const displayTime = Math.abs(timeLeft);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const energyPips = Array.from({ length: maxEnergy }, (_, i) => i < energy);

  return (
    <div className="resource-bar">
      <div className="resource-item resource-energy">
        <Zap size={16} className="resource-icon" />
        <div className="energy-pips">
          {energyPips.map((active, i) => (
            <span
              key={i}
              className={`pip ${active ? 'pip--active' : 'pip--spent'}`}
            />
          ))}
        </div>
      </div>

      <div className={`resource-item resource-timer ${isOvertime ? 'resource-timer--overtime' : ''}`}>
        {isOvertime && <AlertTriangle size={14} className="overtime-icon" />}
        <Clock size={16} className="resource-icon" />
        <span className="timer-value mono">
          {isOvertime ? '-' : ''}{timeStr}
        </span>
      </div>
    </div>
  );
}
