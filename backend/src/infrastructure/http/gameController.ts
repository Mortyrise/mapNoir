import { Router, Request, Response } from 'express';
import { GenerateRound, SubmitAnswer, RequestExtraClue } from '../../application';

export function createGameController(
  generateRound: GenerateRound,
  submitAnswer: SubmitAnswer,
  requestExtraClue: RequestExtraClue,
): Router {
  const router = Router();

  router.get('/generate', (_req: Request, res: Response) => {
    try {
      const dto = generateRound.execute();
      res.json(dto);
    } catch {
      res.status(500).json({ error: 'Failed to generate round' });
    }
  });

  router.post('/clue/:roundId', (req: Request, res: Response) => {
    const roundId = req.params['roundId'] as string;
    const { usedClueTexts = [] } = req.body as { usedClueTexts: string[] };

    try {
      const clue = requestExtraClue.execute({ roundId, usedClueTexts });
      if (!clue) {
        res.status(404).json({ error: 'No more clues available' });
        return;
      }
      res.json({ clue });
    } catch {
      res.status(404).json({ error: 'Round not found' });
    }
  });

  router.post('/score', (req: Request, res: Response) => {
    const { roundId, lat, lon, betActive, cluesUsedCount, timeLeft } = req.body;

    if (!roundId || lat == null || lon == null) {
      res.status(400).json({ error: 'Missing required fields: roundId, lat, lon' });
      return;
    }

    try {
      const result = submitAnswer.execute({
        roundId,
        lat,
        lon,
        betActive: betActive ?? false,
        cluesUsedCount: cluesUsedCount ?? 0,
        timeLeft: timeLeft ?? 60,
      });
      res.json(result);
    } catch {
      res.status(404).json({ error: 'Round not found or expired' });
    }
  });

  return router;
}
