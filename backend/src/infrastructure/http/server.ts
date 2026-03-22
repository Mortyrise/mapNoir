import express from 'express';
import cors from 'cors';
import { createGameController } from './gameController';
import { GenerateRound, SubmitAnswer, RequestExtraClue } from '../../application';
import { InMemoryRoundRepository } from '../persistence/InMemoryRoundRepository';
import { JsonCountryRepository } from '../persistence/JsonCountryRepository';
import { JsonImageSource } from '../persistence/JsonImageSource';
import { TemplateClueGenerator } from '../clues/TemplateClueGenerator';

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // -- Wire dependencies --
  const roundRepo = new InMemoryRoundRepository();
  const countryRepo = new JsonCountryRepository();
  const imageSource = new JsonImageSource();
  const clueGen = new TemplateClueGenerator();

  const generateRound = new GenerateRound(roundRepo, countryRepo, clueGen, imageSource);
  const submitAnswer = new SubmitAnswer(roundRepo, countryRepo);
  const requestExtraClue = new RequestExtraClue(roundRepo, clueGen);

  // -- Routes --
  app.use('/game', createGameController(generateRound, submitAnswer, requestExtraClue));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'map-noir-backend' });
  });

  return app;
}
