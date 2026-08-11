import { useEffect, useReducer } from 'react';
import type { QuizQuestion } from '../content/types';
import { recordQuizResult } from '../lib/progress';
import { useProgressUpdate } from '../lib/store';
import { RichText } from './RichText';
import { ScrollX } from './ScrollX';
import {
  initialQuizState,
  isAnswered,
  quizReducer,
  scoreLabel,
  verdict,
  type QuizAction,
  type QuizState,
} from './quizMachine';

const KIND_LABEL: Record<QuizQuestion['kind'], string> = {
  concept: 'Concept',
  complexity: 'Predict the complexity',
  technique: 'Which technique fits',
};

export function Quiz({
  moduleId,
  questions,
  best,
}: {
  moduleId: string;
  questions: QuizQuestion[];
  best: { correct: number; total: number } | null;
}) {
  const [state, dispatch] = useReducer(
    (current: QuizState, action: QuizAction) => quizReducer(current, action, questions),
    undefined,
    initialQuizState,
  );
  const updateProgress = useProgressUpdate();

  useEffect(() => {
    if (!state.finished) return;
    updateProgress((progress) =>
      recordQuizResult(progress, moduleId, {
        correct: state.correct,
        total: questions.length,
        at: Date.now(),
      }),
    );
  }, [state.finished, state.correct, questions.length, moduleId, updateProgress]);

  if (questions.length === 0) {
    return (
      <div className="card empty">
        <p>The quiz for this module lands with its lesson.</p>
      </div>
    );
  }

  if (state.finished) {
    return (
      <div className="card quiz__result">
        <p className="eyebrow">Result</p>
        <p className="quiz__score">{scoreLabel(state.correct, questions.length)}</p>
        <p className="lede">{verdict(state.correct, questions.length)}</p>
        <ul className="quiz__review">
          {questions.map((question) => {
            const chosen = state.answers[question.id];
            const right = chosen === question.answerIndex;
            return (
              <li key={question.id} className={right ? 'is-right' : 'is-wrong'}>
                <span className="quiz__reviewMark" aria-hidden="true">
                  {right ? '✓' : '✗'}
                </span>
                <span>
                  <RichText text={question.prompt} />
                  {right ? null : (
                    <em className="quiz__reviewFix">{question.options[question.answerIndex]}</em>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="btn btn--block"
          onClick={() => dispatch({ type: 'restart' })}
        >
          Try again
        </button>
      </div>
    );
  }

  const question = questions[state.index];
  const answered = isAnswered(state);

  return (
    <div className="quiz">
      <div className="quiz__head">
        <span className="chip">{KIND_LABEL[question.kind]}</span>
        <span className="quiz__count">
          {state.index + 1} / {questions.length}
        </span>
        {best ? (
          <span className="quiz__best">best {scoreLabel(best.correct, best.total)}</span>
        ) : null}
      </div>

      <div className="quiz__progress" aria-hidden="true">
        <div
          className="quiz__progressFill"
          style={{ transform: `scaleX(${state.index / questions.length})` }}
        />
      </div>

      <p className="quiz__prompt">
        <RichText text={question.prompt} />
      </p>

      {question.context ? (
        <ScrollX className="codeblock quiz__context" label="Question context">
          <pre>
            <code>{question.context}</code>
          </pre>
        </ScrollX>
      ) : null}

      <ul className="quiz__options">
        {question.options.map((option, index) => {
          const isRight = index === question.answerIndex;
          const isChosen = state.selected === index;
          const status = !answered
            ? ''
            : isRight
              ? ' is-right'
              : isChosen
                ? ' is-wrong'
                : ' is-dim';
          return (
            <li key={index}>
              <button
                type="button"
                className={`quiz__option${status}`}
                onClick={() => dispatch({ type: 'answer', optionIndex: index })}
                disabled={answered}
                aria-pressed={isChosen}
              >
                <span className="quiz__optionMark" aria-hidden="true">
                  {answered && isRight
                    ? '✓'
                    : answered && isChosen
                      ? '✗'
                      : String.fromCharCode(65 + index)}
                </span>
                <span>
                  <RichText text={option} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered ? (
        <div className="quiz__feedback" role="status">
          <p
            className={
              state.selected === question.answerIndex
                ? 'quiz__verdict is-right'
                : 'quiz__verdict is-wrong'
            }
          >
            {state.selected === question.answerIndex ? 'Correct' : 'Not quite'}
          </p>
          <p className="quiz__explain">
            <RichText text={question.explain} />
          </p>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => dispatch({ type: 'next' })}
          >
            {state.index + 1 === questions.length ? 'See result' : 'Next question'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
