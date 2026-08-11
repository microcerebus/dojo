import type { VisualizerLink } from '../content/types';
import { visualgoEntryForUrl } from '../data/visualgo';
import { useOnline } from '../lib/useOnline';

/**
 * "Visualize it live" - links out to VisuAlgo (https://visualgo.net), never
 * embedded: VisuAlgo's visualizations are copyrighted educational material,
 * not licensed for copying or embedding.
 */
export function VisualizerRow({ visualizers }: { visualizers?: VisualizerLink[] }) {
  const online = useOnline();
  if (!visualizers || visualizers.length === 0) return null;

  return (
    <section className="vizrow" aria-label="Live VisuAlgo visualizers">
      <div className="vizrow__head">
        <h2 className="vizrow__title">Visualize it live</h2>
        <span className="chip chip--accent">external</span>
        <span className={`chip${online ? '' : ' chip--warn'}`}>needs network</span>
      </div>
      <p className="vizrow__attrib">
        Interactive visualizers from{' '}
        <a href="https://visualgo.net/en" target="_blank" rel="noreferrer noopener">
          VisuAlgo
        </a>
        , by Steven Halim et al. - dojo only links to them, it never copies or embeds them.
      </p>
      {!online ? (
        <p className="vizrow__offline" role="status">
          You are offline - these links will not load until your connection is back.
        </p>
      ) : null}
      <ul className="vizrow__list">
        {visualizers.map((viz) => {
          const entry = visualgoEntryForUrl(viz.url);
          return (
            <li key={viz.url} className={`vizrow__item${online ? '' : ' is-disabled'}`}>
              <a
                className="vizrow__link"
                href={viz.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-disabled={!online}
                onClick={(event) => {
                  if (!online) event.preventDefault();
                }}
              >
                <span className="vizrow__linkTitle">
                  {entry?.title ?? 'VisuAlgo'} <span aria-hidden="true">↗</span>
                </span>
                <span className="vizrow__note">{viz.note}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
