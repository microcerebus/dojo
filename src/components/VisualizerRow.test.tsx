import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { VisualizerRow } from './VisualizerRow';

const visualizers = [
  { url: 'https://visualgo.net/en/bst', note: 'Insert values and predict the shape.' },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('VisualizerRow', () => {
  it('renders nothing when the module has no visualizers', () => {
    const { container } = render(<VisualizerRow visualizers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('links out with the note and no embedding', () => {
    render(<VisualizerRow visualizers={visualizers} />);
    const link = screen.getByRole('link', { name: /Binary Search Tree.*AVL Tree/ });
    expect(link).toHaveAttribute('href', 'https://visualgo.net/en/bst');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(visualizers[0].note)).toBeInTheDocument();
  });

  /**
   * `navigator.onLine` is a hint, not an authority - it false-reports offline
   * on some networks even while the connection works. It may dim the link and
   * add a status note, but it must never stop the click: the browser is what
   * actually knows whether a request will succeed.
   */
  it('dims the link when offline but never blocks the click', () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    render(<VisualizerRow visualizers={visualizers} />);

    const link = screen.getByRole('link', { name: /Binary Search Tree.*AVL Tree/ });
    expect(link).not.toHaveAttribute('aria-disabled');
    expect(link.closest('li')).toHaveClass('is-maybe-offline');

    const event = fireEvent.click(link);
    // jsdom's default navigation for an unhandled click on a link with an
    // href returns true (not prevented) unless the app calls preventDefault.
    expect(event).toBe(true);

    expect(screen.getByRole('status')).toHaveTextContent(/only a hint/i);
  });

  it('shows no offline note when online', () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true);
    render(<VisualizerRow visualizers={visualizers} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
