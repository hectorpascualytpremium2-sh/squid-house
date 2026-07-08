import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Question } from '../shared/types/game.types.js';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');

function isQuestionOption(value: unknown): value is Question['options'][number] {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { text?: unknown }).text === 'string'
  );
}

function isQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Question;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    typeof candidate.correctOptionId === 'string' &&
    Array.isArray(candidate.options) &&
    candidate.options.every(isQuestionOption)
  );
}

function parseQuestions(raw: string): readonly Question[] {
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || !parsed.every(isQuestion)) {
    throw new Error('questions.json must contain an array of Question objects');
  }

  return Object.freeze(parsed.map((question) => Object.freeze({
    ...question,
    options: Object.freeze([...question.options]),
  })));
}

export class QuestionManager {
  private readonly questions: readonly Question[];

  private constructor(questions: readonly Question[]) {
    this.questions = questions;
  }

  static loadFromDisk(questionsPath = join(DATA_DIR, 'questions.json')): QuestionManager {
    const raw = readFileSync(questionsPath, 'utf-8');
    return new QuestionManager(parseQuestions(raw));
  }

  getQuestion(index: number): Question | null {
    return this.questions[index] ?? null;
  }

  getTotalQuestions(): number {
    return this.questions.length;
  }
}
