import { ScrollX } from './ScrollX';

export type TabItem<T extends string> = {
  value: T;
  label: string;
  /** A running total shown under the label, so a long tab never wraps. */
  count?: string;
};

/**
 * The app's only tab strip. It is a `ScrollX` so a set of labels too wide for a
 * 390px screen scrolls with a fade instead of wrapping - the coverage tabs used
 * to break "Blind 75 · 0/75" across two lines and spill out of the pill.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <ScrollX className="tabs">
      <div className="tabs__row" role="tablist" aria-label={label}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={value === item.value}
            className={`tabs__tab${value === item.value ? ' is-active' : ''}`}
            onClick={() => onChange(item.value)}
          >
            <span className="tabs__tabLabel">{item.label}</span>
            {item.count ? <span className="tabs__tabCount">{item.count}</span> : null}
          </button>
        ))}
      </div>
    </ScrollX>
  );
}
