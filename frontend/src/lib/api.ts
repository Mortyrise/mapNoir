const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface ClueDTO {
  type: string;
  text: string;
}

export interface RoundDTO {
  roundId: string;
  mapillaryId: string;
  clues: ClueDTO[];
}

export interface ScoreBreakdownDTO {
  base: number;
  afterCoherence: number;
  afterResources: number;
  final: number;
  coherenceBonus: boolean;
  coherenceRatio: number;
  distanceKm: number;
  betMultiplier: number;
}

export interface ScoreResultDTO {
  score: number;
  breakdown: ScoreBreakdownDTO;
  realLat: number;
  realLon: number;
  countryName: string;
  playerCountryName: string | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  generateRound: () => request<RoundDTO>('/game/generate'),

  submitScore: (body: {
    roundId: string;
    lat: number;
    lon: number;
    betActive: boolean;
    cluesUsedCount: number;
    timeLeft: number;
  }) => request<ScoreResultDTO>('/game/score', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  requestClue: (roundId: string, usedClueTexts: string[]) =>
    request<{ clue: ClueDTO }>(`/game/clue/${roundId}`, {
      method: 'POST',
      body: JSON.stringify({ usedClueTexts }),
    }),
};
