import { Fragment, type ReactNode } from 'react';

/**
 * Minimal inline formatting for lesson prose: `**bold**`, `*italic*` and
 * `` `code` ``.
 *
 * A markdown dependency would be tens of kilobytes to support three constructs
 * the content never goes beyond, so this is 30 lines instead.
 *
 * The bold alternative is listed first so it wins over italic, and the italic
 * alternative requires a non-space after the opening marker so that a literal
 * `a * b` is left alone.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;

export function renderInline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function RichText({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
