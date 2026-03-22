import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { RoundDTO, ScoreResultDTO, ClueDTO } from '../lib/api';

export type GamePhase = 'idle' | 'loading' | 'playing' | 'result' | 'summary';

export interface RoundState {
  dto: RoundDTO;
  extraClues: ClueDTO[];
  result: ScoreResultDTO | null;
}

export interface GameState {
  phase: GamePhase;
  currentRoundIndex: number;
  rounds: RoundState[];
  totalScore: number;
}

const ROUNDS_PER_GAME = 5;

export function useGame() {
  const [state, setState] = useState<GameState>({
    phase: 'idle',
    currentRoundIndex: 0,
    rounds: [],
    totalScore: 0,
  });

  const startGame = useCallback(async () => {
    setState(prev => ({ ...prev, phase: 'loading', rounds: [], totalScore: 0, currentRoundIndex: 0 }));
    try {
      const dto = await api.generateRound();
      setState(prev => ({
        ...prev,
        phase: 'playing',
        rounds: [{ dto, extraClues: [], result: null }],
      }));
    } catch {
      setState(prev => ({ ...prev, phase: 'idle' }));
    }
  }, []);

  const submitAnswer = useCallback(async (
    lat: number,
    lon: number,
    betActive: boolean,
    cluesUsedCount: number,
    timeLeft: number,
  ) => {
    const current = state.rounds[state.currentRoundIndex];
    if (!current) return;

    const result = await api.submitScore({
      roundId: current.dto.roundId,
      lat,
      lon,
      betActive,
      cluesUsedCount,
      timeLeft,
    });

    setState(prev => {
      const rounds = [...prev.rounds];
      rounds[prev.currentRoundIndex] = { ...rounds[prev.currentRoundIndex], result };
      return {
        ...prev,
        phase: 'result',
        rounds,
        totalScore: prev.totalScore + result.score,
      };
    });
  }, [state.rounds, state.currentRoundIndex]);

  const nextRound = useCallback(async () => {
    const nextIndex = state.currentRoundIndex + 1;

    if (nextIndex >= ROUNDS_PER_GAME) {
      setState(prev => ({ ...prev, phase: 'summary' }));
      return;
    }

    setState(prev => ({ ...prev, phase: 'loading' }));
    try {
      const dto = await api.generateRound();
      setState(prev => ({
        ...prev,
        phase: 'playing',
        currentRoundIndex: nextIndex,
        rounds: [...prev.rounds, { dto, extraClues: [], result: null }],
      }));
    } catch {
      setState(prev => ({ ...prev, phase: 'summary' }));
    }
  }, [state.currentRoundIndex]);

  const requestExtraClue = useCallback(async () => {
    const current = state.rounds[state.currentRoundIndex];
    if (!current) return null;

    const usedTexts = [
      ...current.dto.clues.map(c => c.text),
      ...current.extraClues.map(c => c.text),
    ];

    try {
      const { clue } = await api.requestClue(current.dto.roundId, usedTexts);
      setState(prev => {
        const rounds = [...prev.rounds];
        const cur = rounds[prev.currentRoundIndex];
        rounds[prev.currentRoundIndex] = {
          ...cur,
          extraClues: [...cur.extraClues, clue],
        };
        return { ...prev, rounds };
      });
      return clue;
    } catch {
      return null;
    }
  }, [state.rounds, state.currentRoundIndex]);

  const resetGame = useCallback(() => {
    setState({ phase: 'idle', currentRoundIndex: 0, rounds: [], totalScore: 0 });
  }, []);

  const currentRound = state.rounds[state.currentRoundIndex] ?? null;

  return {
    state,
    currentRound,
    roundsPerGame: ROUNDS_PER_GAME,
    startGame,
    submitAnswer,
    nextRound,
    requestExtraClue,
    resetGame,
  };
}
