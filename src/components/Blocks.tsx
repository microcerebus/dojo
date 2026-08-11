import type { Block } from '../content/types';
import { getAnimation } from '../anim/registry';
import { AnimationPlayer } from '../anim/AnimationPlayer';
import { RichText } from './RichText';
import { ScrollX } from './ScrollX';

const TONE_LABEL: Record<'key' | 'tip' | 'warn', string> = {
  key: 'Key idea',
  tip: 'Tip',
  warn: 'Watch out',
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="lesson__p">
          <RichText text={block.text} />
        </p>
      );

    case 'bullets':
      return (
        <ul className="lesson__list">
          {block.items.map((item, index) => (
            <li key={index}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="lesson__list lesson__list--numbered">
          {block.items.map((item, index) => (
            <li key={index}>
              <span className="lesson__stepNum" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case 'code':
      return (
        <figure className="lesson__code">
          <ScrollX className="codeblock" label={block.caption ?? 'Code sample'}>
            <pre>
              <code>{block.code}</code>
            </pre>
          </ScrollX>
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );

    case 'callout':
      return (
        <aside className={`callout callout--${block.tone}`}>
          <p className="callout__title">
            <span className="callout__badge" aria-hidden="true">
              {block.tone === 'key' ? '◆' : block.tone === 'tip' ? '✦' : '▲'}
            </span>
            <span className="visually-hidden">{TONE_LABEL[block.tone]}: </span>
            {block.title}
          </p>
          <p className="callout__text">
            <RichText text={block.text} />
          </p>
        </aside>
      );

    case 'table':
      return (
        <figure className="lesson__table">
          <ScrollX className="tablewrap" label={block.caption ?? 'Table'}>
            <table>
              <thead>
                <tr>
                  {block.headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollX>
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );

    case 'anim': {
      const spec = getAnimation(block.animId);
      if (!spec) return null;
      return <AnimationPlayer spec={spec} />;
    }

    default:
      return null;
  }
}
