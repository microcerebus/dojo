/**
 * The shared visual vocabulary every animation is built from.
 *
 * Everything is plain DOM + CSS (transforms/opacity only) rather than canvas or
 * SVG where possible: it stays crisp, it reflows on a 390px screen, and the
 * per-frame work is a class change.
 */
import type { ReactNode } from 'react';

export type CellState =
  | 'idle'
  | 'active' // currently being looked at
  | 'compare' // the other half of a comparison
  | 'done' // finished / accepted
  | 'bad' // rejected / mismatch
  | 'muted' // out of play
  | 'target'; // the answer

export interface CellSpec {
  key: string;
  label: string;
  state?: CellState;
  /** small text under the cell, e.g. an index */
  sub?: string;
}

export function Cells({
  cells,
  size = 'md',
  label,
}: {
  cells: CellSpec[];
  size?: 'sm' | 'md';
  label?: string;
}) {
  return (
    <div className="viz__row" role="list" aria-label={label}>
      {cells.map((cell) => (
        <div
          key={cell.key}
          role="listitem"
          className={`viz__cell viz__cell--${size} is-${cell.state ?? 'idle'}`}
        >
          <span className="viz__cellLabel">{cell.label}</span>
          {cell.sub ? <span className="viz__cellSub">{cell.sub}</span> : null}
        </div>
      ))}
    </div>
  );
}

export interface PointerSpec {
  key: string;
  /** index of the cell this points at */
  at: number;
  label: string;
  tone?: 'a' | 'b' | 'c';
}

/**
 * Pointer markers that line up with `Cells`. Positioned with a CSS grid whose
 * column count matches the cell count, so they stay aligned at any width.
 */
export function Pointers({
  pointers,
  count,
  below = false,
}: {
  pointers: PointerSpec[];
  count: number;
  below?: boolean;
}) {
  return (
    <div
      className={`viz__pointers${below ? ' viz__pointers--below' : ''}`}
      style={{ gridTemplateColumns: `repeat(${count}, var(--cell-size))` }}
      aria-hidden="true"
    >
      {pointers.map((pointer) => (
        <span
          key={pointer.key}
          className={`viz__pointer viz__pointer--${pointer.tone ?? 'a'}`}
          style={{ gridColumn: Math.min(Math.max(pointer.at + 1, 1), count) }}
        >
          {below ? null : <span className="viz__pointerArrow">▼</span>}
          <span className="viz__pointerLabel">{pointer.label}</span>
          {below ? <span className="viz__pointerArrow">▲</span> : null}
        </span>
      ))}
    </div>
  );
}

export function Stage({ children, tall }: { children: ReactNode; tall?: boolean }) {
  return <div className={`viz${tall ? ' viz--tall' : ''}`}>{children}</div>;
}

export function Caption({ children }: { children: ReactNode }) {
  return <p className="viz__note">{children}</p>;
}

/** Key/value readout strip, e.g. counters and accumulators. */
export function Readout({ items }: { items: { key: string; label: string; value: string }[] }) {
  return (
    <dl className="viz__readout">
      {items.map((item) => (
        <div key={item.key} className="viz__readoutItem">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface NodeSpec {
  key: string;
  label: string;
  state?: CellState;
  /** shown above the node, e.g. a pointer name */
  tag?: string;
}

/** A chain of linked-list nodes with arrows; wraps onto more rows if narrow. */
export function NodeChain({
  nodes,
  tail = '∅',
  loopFrom,
}: {
  nodes: NodeSpec[];
  /** what the last arrow points at; `null` hides the terminator */
  tail?: string | null;
  /** index whose next pointer loops back to the index given (draws a badge) */
  loopFrom?: { from: number; to: number } | null;
}) {
  return (
    <div className="viz__chain">
      {nodes.map((node, i) => (
        <div className="viz__chainItem" key={node.key}>
          <div className={`viz__node is-${node.state ?? 'idle'}`}>
            {node.tag ? <span className="viz__nodeTag">{node.tag}</span> : null}
            <span className="viz__nodeLabel">{node.label}</span>
          </div>
          {i < nodes.length - 1 ? (
            <span className="viz__arrow" aria-hidden="true">
              →
            </span>
          ) : tail !== null ? (
            <span className="viz__arrow viz__arrow--tail" aria-hidden="true">
              →<em>{tail}</em>
            </span>
          ) : null}
        </div>
      ))}
      {loopFrom ? (
        <p className="viz__loopNote">
          node {loopFrom.from + 1}&apos;s next points back to node {loopFrom.to + 1}
        </p>
      ) : null}
    </div>
  );
}

/** Vertical stack, grows upward like a real stack drawing. */
export function StackColumn({
  items,
  label,
  hint,
}: {
  items: CellSpec[];
  label: string;
  hint?: string;
}) {
  return (
    <div className="viz__stack">
      <div className="viz__stackItems">
        {[...items].reverse().map((item) => (
          <div key={item.key} className={`viz__stackCell is-${item.state ?? 'idle'}`}>
            <span>{item.label}</span>
            {item.sub ? <em>{item.sub}</em> : null}
          </div>
        ))}
        {items.length === 0 ? <div className="viz__stackEmpty">empty</div> : null}
      </div>
      <div className="viz__stackBase">
        {label}
        {hint ? <em>{hint}</em> : null}
      </div>
    </div>
  );
}

/** Horizontal queue: front on the left. */
export function QueueRow({ items, label }: { items: CellSpec[]; label: string }) {
  return (
    <div className="viz__queue">
      <span className="viz__queueEnd">front</span>
      <div className="viz__queueItems">
        {items.length === 0 ? (
          <span className="viz__stackEmpty">empty</span>
        ) : (
          items.map((item) => (
            <div key={item.key} className={`viz__queueCell is-${item.state ?? 'idle'}`}>
              {item.label}
            </div>
          ))
        )}
      </div>
      <span className="viz__queueEnd">back</span>
      <span className="viz__queueLabel">{label}</span>
    </div>
  );
}

export interface BucketSpec {
  key: string;
  index: number;
  entries: { key: string; label: string; state?: CellState }[];
  state?: CellState;
}

/** Hash-table buckets with separate chaining. */
export function Buckets({ buckets }: { buckets: BucketSpec[] }) {
  return (
    <div className="viz__buckets">
      {buckets.map((bucket) => (
        <div key={bucket.key} className={`viz__bucket is-${bucket.state ?? 'idle'}`}>
          <span className="viz__bucketIndex">{bucket.index}</span>
          <div className="viz__bucketChain">
            {bucket.entries.length === 0 ? (
              <span className="viz__bucketEmpty">·</span>
            ) : (
              bucket.entries.map((entry) => (
                <span key={entry.key} className={`viz__chip is-${entry.state ?? 'done'}`}>
                  {entry.label}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ChipSpec {
  key: string;
  label: string;
  state?: CellState;
  /** small trailing note, e.g. what this points at or who holds it */
  sub?: string;
}

/**
 * A row of auto-sized labelled chips.
 *
 * `Cells` is a fixed square, which is right for single values and wrong for
 * word-length labels - `ParkingLot` in a 34px box just overflows. Anything
 * whose label is a word belongs here instead.
 */
export function Chips({ chips, label }: { chips: ChipSpec[]; label?: string }) {
  return (
    <div className="viz__chips" role="list" aria-label={label}>
      {chips.map((chip) => (
        <span key={chip.key} role="listitem" className={`viz__chip is-${chip.state ?? 'idle'}`}>
          {chip.label}
          {chip.sub ? <em>{chip.sub}</em> : null}
        </span>
      ))}
    </div>
  );
}

export interface BarSpec {
  key: string;
  label: string;
  /** 0..1 */
  value: number;
  caption?: string;
  state?: CellState;
}

export function Bars({ bars, height = 130 }: { bars: BarSpec[]; height?: number }) {
  return (
    <div className="viz__bars" style={{ ['--bars-height' as string]: `${height}px` }}>
      {bars.map((bar) => (
        <div key={bar.key} className="viz__barCol">
          <span className="viz__barValue">{bar.caption ?? ''}</span>
          <div className="viz__barTrack">
            <div
              className={`viz__bar is-${bar.state ?? 'idle'}`}
              style={{ height: `${Math.max(2, Math.min(1, bar.value) * 100)}%` }}
            />
          </div>
          <span className="viz__barLabel">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

/** A 2D grid, used for matrices and DP tables. */
export function Matrix({
  rows,
  rowLabels,
  colLabels,
}: {
  rows: CellSpec[][];
  rowLabels?: string[];
  colLabels?: string[];
}) {
  const width = rows[0]?.length ?? 0;
  return (
    <div className="viz__matrixWrap">
      {colLabels ? (
        <div
          className="viz__matrixCols"
          style={{ gridTemplateColumns: `repeat(${width}, var(--cell-size))` }}
        >
          {colLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      ) : null}
      <div className="viz__matrixBody">
        {rowLabels ? (
          <div className="viz__matrixRows">
            {rowLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        ) : null}
        <div
          className="viz__matrix"
          style={{ gridTemplateColumns: `repeat(${width}, var(--cell-size))` }}
        >
          {rows.flatMap((row) =>
            row.map((cell) => (
              <div key={cell.key} className={`viz__cell viz__cell--sm is-${cell.state ?? 'idle'}`}>
                <span className="viz__cellLabel">{cell.label}</span>
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

export interface TreeNodeSpec {
  key: string;
  label: string;
  /** 0-based depth */
  depth: number;
  /** horizontal slot within the whole tree, 0..slots-1 */
  slot: number;
  state?: CellState;
  /** slot of the parent, for drawing the connector */
  parentSlot?: number;
  badge?: string;
}

/**
 * Small tree/recursion-tree renderer. Nodes are positioned on a normalised
 * grid, and connectors are absolutely positioned lines - no SVG viewBox maths
 * to get wrong on a narrow screen.
 */
export function TreeViz({
  nodes,
  slots,
  depth,
}: {
  nodes: TreeNodeSpec[];
  slots: number;
  depth: number;
}) {
  const rowHeight = 100 / Math.max(depth, 1);
  return (
    <div className="viz__tree" style={{ ['--tree-depth' as string]: depth }}>
      {nodes.map((node) => {
        const left = ((node.slot + 0.5) / slots) * 100;
        const top = node.depth * rowHeight;
        const parentLeft =
          node.parentSlot === undefined ? null : ((node.parentSlot + 0.5) / slots) * 100;
        return (
          <div key={node.key}>
            {parentLeft === null ? null : (
              <span
                className="viz__treeEdge"
                aria-hidden="true"
                style={{
                  left: `${Math.min(left, parentLeft)}%`,
                  top: `calc(${top - rowHeight}% + var(--tree-node) / 2)`,
                  width: `${Math.abs(left - parentLeft)}%`,
                  height: `${rowHeight}%`,
                  ['--edge-dir' as string]: left >= parentLeft ? '1' : '-1',
                }}
              />
            )}
            <span
              className={`viz__treeNode is-${node.state ?? 'idle'}`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {node.label}
              {node.badge ? <em>{node.badge}</em> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Bit row for bit-manipulation animations. */
export function Bits({
  bits,
  label,
  showIndices,
}: {
  bits: { key: string; value: 0 | 1; state?: CellState }[];
  label?: string;
  showIndices?: boolean;
}) {
  return (
    <div className="viz__bitsRow">
      {label ? <span className="viz__bitsLabel">{label}</span> : null}
      <div className="viz__bits">
        {bits.map((bit, i) => (
          <span key={bit.key} className={`viz__bit is-${bit.state ?? 'idle'}`}>
            {bit.value}
            {showIndices ? <em>{bits.length - 1 - i}</em> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface FlowStepSpec {
  key: string;
  label: string;
  /** what you actually do/say at this step */
  detail?: string;
  state?: CellState;
  badge?: string;
}

/** A vertical list of stages - used for process flows and runtime ladders. */
export function FlowSteps({ steps }: { steps: FlowStepSpec[] }) {
  return (
    <ol className="viz__flow">
      {steps.map((step, i) => (
        <li key={step.key} className={`viz__flowStep is-${step.state ?? 'idle'}`}>
          <span className="viz__flowIndex">{i + 1}</span>
          <span className="viz__flowBody">
            <span className="viz__flowLabel">
              {step.label}
              {step.badge ? <em>{step.badge}</em> : null}
            </span>
            {step.detail ? <span className="viz__flowDetail">{step.detail}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Legend({ items }: { items: { key: string; state: CellState; label: string }[] }) {
  return (
    <ul className="viz__legend">
      {items.map((item) => (
        <li key={item.key}>
          <span className={`viz__swatch is-${item.state}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
