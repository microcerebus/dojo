import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RichText } from './RichText';
import { MODULES } from '../content';

describe('RichText', () => {
  it('renders bold, italic and code', () => {
    const { container } = render(
      <RichText text="A **bold** and *italic* word with `code()` in it." />,
    );
    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('em')).toHaveTextContent('italic');
    expect(container.querySelector('code')).toHaveTextContent('code()');
    expect(container.textContent).toBe('A bold and italic word with code() in it.');
  });

  it('prefers bold over italic for a double marker', () => {
    const { container } = render(<RichText text="**both**" />);
    expect(container.querySelector('strong')).toHaveTextContent('both');
    expect(container.querySelector('em')).toBeNull();
  });

  it('leaves a literal asterisk used as multiplication alone', () => {
    render(<RichText text="the cost is a * b, not a + b" />);
    expect(screen.getByText('the cost is a * b, not a + b')).toBeInTheDocument();
  });

  it('leaves plain text untouched', () => {
    const { container } = render(<RichText text="no markup here" />);
    expect(container.textContent).toBe('no markup here');
    expect(container.querySelector('strong')).toBeNull();
  });
});

describe('lesson content markup', () => {
  /** Every string the inline renderer will see. */
  const strings = MODULES.flatMap((courseModule) =>
    courseModule.sections.flatMap((section) =>
      section.blocks.flatMap((block) => {
        switch (block.kind) {
          case 'p':
            return [block.text];
          case 'bullets':
          case 'steps':
            return block.items;
          case 'callout':
            return [block.text];
          case 'table':
            return block.rows.flat();
          default:
            return [];
        }
      }),
    ),
  );

  it('has content to check', () => {
    expect(strings.length).toBeGreaterThan(100);
  });

  it('never leaves an unbalanced emphasis marker that would render literally', () => {
    const offenders = strings.filter((text) => {
      // Strip the constructs the renderer understands, then look for leftovers
      // that are attached to a word (a stray `*` from unbalanced markup).
      const stripped = text
        .replace(/\*\*[^*]+\*\*/g, '')
        .replace(/\*[^*\s][^*]*\*/g, '')
        .replace(/`[^`]+`/g, '');
      return /\*\S|\S\*/.test(stripped);
    });
    expect(offenders).toEqual([]);
  });

  it('never leaves an unclosed backtick', () => {
    const offenders = strings.filter((text) => (text.match(/`/g)?.length ?? 0) % 2 !== 0);
    expect(offenders).toEqual([]);
  });
});
