import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimationPlayer } from './AnimationPlayer';
import { ALL_ANIMATIONS, getAnimation } from './registry';
import type { AnimationSpec } from './types';

const spec: AnimationSpec = {
  id: 'test-anim',
  title: 'Test animation',
  blurb: 'Three steps.',
  length: 3,
  caption: (index) => `Caption for step ${index + 1}`,
  detail: (index) => `detail ${index}`,
  Frame: ({ index }) => <div data-testid="frame">frame {index}</div>,
};

describe('AnimationPlayer', () => {
  it('renders the first frame with its caption', () => {
    render(<AnimationPlayer spec={spec} />);
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 0');
    expect(screen.getByText('Caption for step 1')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('steps forward and back with the buttons', async () => {
    const user = userEvent.setup();
    render(<AnimationPlayer spec={spec} />);

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 1');
    expect(screen.getByText('Caption for step 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 0');
  });

  it('disables the controls at each end', async () => {
    const user = userEvent.setup();
    render(<AnimationPlayer spec={spec} />);

    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled();
  });

  it('steps with the arrow keys when the stage has focus', async () => {
    const user = userEvent.setup();
    render(<AnimationPlayer spec={spec} />);

    const stage = screen.getByRole('group', { name: /Test animation/ });
    stage.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 2');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 1');

    await user.keyboard('{Home}');
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 0');
  });

  it('resets to the first frame', async () => {
    const user = userEvent.setup();
    render(<AnimationPlayer spec={spec} />);

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    await user.click(screen.getByRole('button', { name: 'Back to first step' }));
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 0');
  });

  it('jumps to a step via the tick strip', async () => {
    const user = userEvent.setup();
    render(<AnimationPlayer spec={spec} />);

    await user.click(screen.getByRole('button', { name: 'Step 3' }));
    expect(screen.getByTestId('frame')).toHaveTextContent('frame 2');
  });

  it('exposes the current step to assistive technology', () => {
    render(<AnimationPlayer spec={spec} />);
    expect(
      screen.getByRole('group', { name: /Step 1 of 3.*swipe to step/ }),
    ).toBeInTheDocument();
  });
});

describe('every registered animation', () => {
  it('renders each of its frames without throwing', () => {
    for (const animation of ALL_ANIMATIONS) {
      for (let index = 0; index < animation.length; index++) {
        const { unmount } = render(<animation.Frame index={index} />);
        unmount();
      }
    }
  });

  it('is reachable from the registry by id', () => {
    for (const animation of ALL_ANIMATIONS) {
      expect(getAnimation(animation.id)).toBe(animation);
    }
    expect(getAnimation('does-not-exist')).toBeUndefined();
  });
});
