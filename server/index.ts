import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Player } from '../shared/types/game.types.js';

import { GameEngine } from './gameEngine.js';
import { QuestionManager } from './questionManager.js';
import { attachSocketServer } from './socket.js';

const PORT = Number(process.env.PORT ?? 3001);
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');

interface ScoresFile {
  readonly players: readonly Player[];
}

function loadInitialPlayers(): readonly Player[] {
  const scoresPath = join(DATA_DIR, 'scores.json');
  const raw = readFileSync(scoresPath, 'utf-8');
  const parsed = JSON.parse(raw) as ScoresFile;

  if (!Array.isArray(parsed.players)) {
    throw new Error('scores.json must contain a players array');
  }

  return parsed.players.map((player) => ({
    ...player,
    isConnected: false,
  }));
}

const questionManager = QuestionManager.loadFromDisk();
const engine = new GameEngine(questionManager, loadInitialPlayers());
const httpServer = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Squid House game server');
});

attachSocketServer(httpServer, engine);

httpServer.listen(PORT, () => {
  console.log(`Game server listening on port ${PORT}`);
  console.log(`Loaded ${questionManager.getTotalQuestions()} questions from disk`);
});
