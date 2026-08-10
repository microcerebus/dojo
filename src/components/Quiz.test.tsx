import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quiz } from './Quiz';
import { DrillList } from './DrillList';
import { progressStore } from '../lib/store';
import { moduleProgress, parseProgress, PROGRESS_STORAGE_KEY } from '../lib/progress';
import type { QuizQuestion } from '../content/types';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'demo-1',
    kind: 'concept',
    prompt: 'What does big O measure?',
    options: ['Wall-clock time', 'How work grows with the input'],
    answerIndex: 1,
    explain: 'It is a rate of growth, not a stopwatch.',
  },
  {
    id: 'demo-2',
    kind: 'complexity',
    prompt: 'Cost of a nested loop over the same array?',
    options: ['O(n)', 'O(n log n)', 'O(n²)'],
    answerIndex: 2,
    explain: 'Every pair is visited.',
  },
];

beforeEach(() => {
  localStorage.clear();
  progressStore.reset();
});

describe('Quiz component', () => {
  it('gives instant feedback with an explanation', async () => {
    const user = userEvent.setup();
    render(<Quiz moduleId="demo" questions={QUESTIONS} best={null} />);

    await user.click(screen.getByRole('button', { name: /How work grows/ }));

    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText(/rate of growth/)).toBeInTheDocument();
  });

  it('marks a wrong answer and still shows why', async () => {
    const user = userEvent.setup();
    render(<Quiz moduleId="demo" questions={QUESTIONS} best={null} />);

    await user.click(screen.getByRole('button', { name: /Wall-clock time/ }));

    expect(screen.getByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText(/rate of growth/)).toBeInTheDocument();
  });

  it('disables the options after answering, so a score cannot be farmed', async () => {
    const user = userEvent.setup();
    render(<Quiz moduleId="demo" questions={QUESTIONS} best={null} />);

    await user.click(screen.getByRole('button', { name: /Wall-clock time/ }));
    const right = screen.getByRole('button', { name: /How work grows/ });
    expect(right).toBeDisabled();

    await user.click(right);
    expect(screen.getByText('Not quite')).toBeInTheDocument();
  });

  it('persists the score when the quiz finishes', async () => {
    const user = userEvent.setup();
    render(<Quiz moduleId="demo" questions={QUESTIONS} best={null} />);

    await user.click(screen.getByRole('button', { name: /How work grows/ }));
    await user.click(screen.getByRole('button', { name: /Next question/ }));
    await user.click(screen.getByRole('button', { name: /O\(n²\)/ }));
    await user.click(screen.getByRole('button', { name: /See result/ }));

    expect(screen.getByText('2/2 · 100%')).toBeInTheDocument();

    // What a reload would read back.
    const reloaded = parseProgress(
      JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string),
    );
    expect(moduleProgress(reloaded, 'demo').quizBest).toMatchObject({ correct: 2, total: 2 });
  });

  it('can be retried from the results screen', async () => {
    const user = userEvent.setup();
    render(<Quiz moduleId="demo" questions={QUESTIONS} best={null} />);

    await user.click(screen.getByRole('button', { name: /Wall-clock time/ }));
    await user.click(screen.getByRole('button', { name: /Next question/ }));
    await user.click(screen.getByRole('button', { name: /O\(n\)$/ }));
    await user.click(screen.getByRole('button', { name: /See result/ }));

    expect(screen.getByText('0/2 · 0%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText('What does big O measure?')).toBeInTheDocument();
  });

  it('shows a message rather than an empty shell when there is no quiz yet', () => {
    render(<Quiz moduleId="demo" questions={[]} best={null} />);
    expect(screen.getByText(/lands with its lesson/)).toBeInTheDocument();
  });
});

describe('DrillList component', () => {
  it('persists a checkbox across a remount, which is what a reload is', async () => {
    const user = userEvent.setup();
    const drills = [{ slug: 'two-sum', note: 'The hash-map complement pattern.' }];

    const first = render(
      <DrillList moduleId="demo" drills={drills} done={{}} />,
    );
    await user.click(screen.getByRole('checkbox', { name: /Mark Two Sum as done/ }));
    first.unmount();

    const reloaded = parseProgress(
      JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string),
    );
    const done = moduleProgress(reloaded, 'demo').drills;
    expect(done['two-sum']).toBe(true);

    render(<DrillList moduleId="demo" drills={drills} done={done} />);
    expect(
      screen.getByRole('checkbox', { name: /Mark Two Sum as not done/ }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('links each drill to LeetCode and tags Blind 75 problems', () => {
    render(
      <DrillList moduleId="demo" drills={[{ slug: 'two-sum' }, { slug: 'min-stack' }]} done={{}} />,
    );

    expect(screen.getByRole('link', { name: /Two Sum/ })).toHaveAttribute(
      'href',
      'https://leetcode.com/problems/two-sum/',
    );
    // Blind 75 problems sort first and carry the badge.
    expect(screen.getAllByText('B75')).toHaveLength(1);
    expect(screen.getByText(/0\s*of\s*2\s*done/)).toBeInTheDocument();
    expect(screen.getByText('Blind 75: 0/1')).toBeInTheDocument();
  });

  it('renders practice tasks for modules that have no LeetCode drills', async () => {
    const user = userEvent.setup();
    render(
      <DrillList
        moduleId="behavioral"
        drills={[]}
        practice={[{ id: 'grid', title: 'Build the story grid', detail: 'Five projects.' }]}
        done={{}}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: /Build the story grid/ }));
    const reloaded = parseProgress(
      JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string),
    );
    expect(moduleProgress(reloaded, 'behavioral').drills['practice:grid']).toBe(true);
  });
});
