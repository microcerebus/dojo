/**
 * Quiz engine, as pure state. The component is a thin renderer over this, and
 * persistence happens when `isFinished` first becomes true.
 */
import type { QuizQuestion } from '../content/types';

export interface QuizState {
  index: number;
  /** answer index chosen for the current question, or null if unanswered */
  selected: number | null;
  /** chosen answer per question id, in order of answering */
  answers: Record<string, number>;
  correct: number;
  finished: boolean;
}

export type QuizAction =
  { type: 'answer'; optionIndex: number } | { type: 'next' } | { type: 'restart' };

export const initialQuizState = (): QuizState => ({
  index: 0,
  selected: null,
  answers: {},
  correct: 0,
  finished: false,
});

export function quizReducer(
  state: QuizState,
  action: QuizAction,
  questions: QuizQuestion[],
): QuizState {
  switch (action.type) {
    case 'answer': {
      // Answers are final: a second tap on the same question is ignored, so a
      // score cannot be farmed by clicking through the options.
      if (state.selected !== null || state.finished) return state;
      const question = questions[state.index];
      if (!question) return state;
      const isCorrect = action.optionIndex === question.answerIndex;
      return {
        ...state,
        selected: action.optionIndex,
        answers: { ...state.answers, [question.id]: action.optionIndex },
        correct: state.correct + (isCorrect ? 1 : 0),
      };
    }

    case 'next': {
      if (state.selected === null) return state; // must answer first
      const nextIndex = state.index + 1;
      if (nextIndex >= questions.length) return { ...state, finished: true, selected: null };
      return { ...state, index: nextIndex, selected: null };
    }

    case 'restart':
      return initialQuizState();

    default:
      return state;
  }
}

export const isAnswered = (state: QuizState) => state.selected !== null;

export function scoreLabel(correct: number, total: number): string {
  if (total === 0) return '—';
  const pct = Math.round((correct / total) * 100);
  return `${correct}/${total} · ${pct}%`;
}

/** A one-line verdict shown on the results card. */
export function verdict(correct: number, total: number): string {
  if (total === 0) return '';
  const ratio = correct / total;
  if (ratio === 1) return 'Clean sweep. Move on to the drills.';
  if (ratio >= 0.8) return 'Solid. Re-read the sections behind anything you missed.';
  if (ratio >= 0.5) return 'Half there. Worth another pass through the lesson before drilling.';
  return 'Read the lesson again before the drills - this one has not landed yet.';
}
