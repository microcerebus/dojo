import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../content/types';
import {
  initialQuizState,
  isAnswered,
  quizReducer,
  scoreLabel,
  verdict,
  type QuizAction,
  type QuizState,
} from './quizMachine';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    kind: 'concept',
    prompt: 'First',
    options: ['a', 'b'],
    answerIndex: 0,
    explain: 'because a',
  },
  {
    id: 'q2',
    kind: 'complexity',
    prompt: 'Second',
    options: ['a', 'b', 'c'],
    answerIndex: 2,
    explain: 'because c',
  },
];

const run = (state: QuizState, ...actions: QuizAction[]) =>
  actions.reduce((current, action) => quizReducer(current, action, QUESTIONS), state);

describe('quiz engine', () => {
  it('starts on the first question with nothing selected', () => {
    expect(initialQuizState()).toEqual({
      index: 0,
      selected: null,
      answers: {},
      correct: 0,
      finished: false,
    });
  });

  it('scores a correct answer and records the choice', () => {
    const state = run(initialQuizState(), { type: 'answer', optionIndex: 0 });
    expect(state.correct).toBe(1);
    expect(state.answers).toEqual({ q1: 0 });
    expect(isAnswered(state)).toBe(true);
  });

  it('does not score a wrong answer but still records it', () => {
    const state = run(initialQuizState(), { type: 'answer', optionIndex: 1 });
    expect(state.correct).toBe(0);
    expect(state.answers).toEqual({ q1: 1 });
  });

  it('ignores a second answer to the same question', () => {
    const first = run(initialQuizState(), { type: 'answer', optionIndex: 1 });
    const second = run(first, { type: 'answer', optionIndex: 0 });
    // Without this, a user could tap every option and score 100%.
    expect(second).toBe(first);
    expect(second.correct).toBe(0);
  });

  it('will not advance before an answer is given', () => {
    const state = initialQuizState();
    expect(run(state, { type: 'next' })).toBe(state);
  });

  it('advances and clears the selection', () => {
    const state = run(initialQuizState(), { type: 'answer', optionIndex: 0 }, { type: 'next' });
    expect(state.index).toBe(1);
    expect(state.selected).toBeNull();
    expect(state.finished).toBe(false);
  });

  it('finishes after the last question', () => {
    const state = run(
      initialQuizState(),
      { type: 'answer', optionIndex: 0 },
      { type: 'next' },
      { type: 'answer', optionIndex: 2 },
      { type: 'next' },
    );
    expect(state.finished).toBe(true);
    expect(state.correct).toBe(2);
    expect(state.answers).toEqual({ q1: 0, q2: 2 });
  });

  it('ignores answers once finished', () => {
    const finished = run(
      initialQuizState(),
      { type: 'answer', optionIndex: 0 },
      { type: 'next' },
      { type: 'answer', optionIndex: 2 },
      { type: 'next' },
    );
    expect(run(finished, { type: 'answer', optionIndex: 0 })).toBe(finished);
  });

  it('restarts from scratch', () => {
    const finished = run(
      initialQuizState(),
      { type: 'answer', optionIndex: 0 },
      { type: 'next' },
      { type: 'answer', optionIndex: 0 },
      { type: 'next' },
    );
    expect(run(finished, { type: 'restart' })).toEqual(initialQuizState());
  });

  it('handles an empty quiz without crashing', () => {
    const state = quizReducer(initialQuizState(), { type: 'answer', optionIndex: 0 }, []);
    expect(state).toEqual(initialQuizState());
  });
});

describe('score presentation', () => {
  it('formats a score with a percentage', () => {
    expect(scoreLabel(8, 10)).toBe('8/10 · 80%');
    expect(scoreLabel(0, 0)).toBe('—');
  });

  it('gives a different verdict at each band', () => {
    const verdicts = [verdict(10, 10), verdict(8, 10), verdict(5, 10), verdict(1, 10)];
    expect(new Set(verdicts).size).toBe(4);
    for (const line of verdicts) expect(line.length).toBeGreaterThan(10);
  });
});
