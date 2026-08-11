import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULES, getModule } from '../content';
import { BOOK_QUESTIONS } from '../data/questions';
import { BLIND_75, getProblem, leetcodeUrl } from '../data/problems';
import { VISUALGO_CATALOG } from '../data/visualgo';
import { formatStudySummary, moduleProgress, moduleStudySummary } from '../lib/progress';
import { useProgressState } from '../lib/store';
import { ScrollX } from '../components/ScrollX';
import { Tabs } from '../components/Tabs';

type View = 'questions' | 'blind75' | 'modules' | 'visualgo';

export function CoveragePage() {
  const [view, setView] = useState<View>('questions');
  const [query, setQuery] = useState('');
  const progress = useProgressState();

  const filteredQuestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return BOOK_QUESTIONS;
    return BOOK_QUESTIONS.filter((question) =>
      [question.id, question.title, question.gist, question.chapter, question.leetcode?.title]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(needle)),
    );
  }, [query]);

  const blindOwner = useMemo(() => {
    const owners = new Map<string, string>();
    for (const courseModule of MODULES) {
      for (const drill of courseModule.drills) {
        if (getProblem(drill.slug)?.blind75) owners.set(drill.slug, courseModule.id);
      }
    }
    return owners;
  }, []);

  const blindDone = BLIND_75.filter((problem) => {
    const owner = blindOwner.get(problem.slug);
    return owner ? moduleProgress(progress, owner).drills[problem.slug] : false;
  }).length;

  return (
    <div className="stack-5">
      <header className="pagehead">
        <p className="eyebrow">Nothing hidden</p>
        <h1>Coverage map</h1>
        <p className="lede">
          All {BOOK_QUESTIONS.length} numbered book questions, every module, and the full Blind 75 -
          with the module that teaches each technique.
        </p>
      </header>

      {/* The counts sit under the labels: as one line, "Blind 75 · 0/75" wrapped
          inside its pill at 390px and pushed the row out of the container. */}
      <Tabs
        items={[
          { value: 'questions', label: 'Questions', count: String(BOOK_QUESTIONS.length) },
          { value: 'blind75', label: 'Blind 75', count: `${blindDone}/75` },
          { value: 'modules', label: 'Modules', count: String(MODULES.length) },
          { value: 'visualgo', label: 'VisuAlgo', count: String(VISUALGO_CATALOG.length) },
        ]}
        value={view}
        onChange={setView}
        label="Coverage views"
      />

      {view === 'questions' ? (
        <>
          <input
            className="search"
            type="search"
            id="coverage-filter"
            name="coverage-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by id, title, chapter or LeetCode name"
            aria-label="Filter questions"
          />
          <p className="lede">
            Showing {filteredQuestions.length} of {BOOK_QUESTIONS.length}.
          </p>
          {/* A list rather than a table: at 390px a four-column table is a
              wall of wrapped text, and this is the view that gets scanned most. */}
          <ul className="qlist">
            {filteredQuestions.map((question) => {
              const owner = getModule(question.moduleId);
              return (
                <li key={question.id} className="qitem">
                  <div className="qitem__head">
                    <span className="qitem__id">{question.id}</span>
                    <strong className="qitem__title">{question.title}</strong>
                  </div>
                  <p className="qitem__gist">{question.gist}</p>
                  <div className="qitem__meta">
                    <span className="qitem__label">Taught in</span>
                    {owner ? (
                      <Link to={`/module/${owner.id}`}>{owner.title}</Link>
                    ) : (
                      <span>{question.moduleId}</span>
                    )}
                    <span className="qitem__sep" aria-hidden="true">
                      ·
                    </span>
                    {question.leetcode ? (
                      <a
                        href={leetcodeUrl(question.leetcode.slug)}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {question.leetcode.title} ↗
                      </a>
                    ) : (
                      <span className="muted">book-only</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {view === 'blind75' ? (
        <>
          <p className="lede">
            {blindDone} of 75 checked off. Ticking a problem here is the same checkbox as in its
            module.
          </p>
          {/* One table at every width: below 720px `table--stack` restacks each
              row as a card and promotes the header cells to per-value labels,
              because four columns at 390px is a wall of two-word lines. */}
          <ScrollX className="tablewrap table--stack__wrap" label="Blind 75 problems">
            <table className="table--stack">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Done</th>
                  <th>Difficulty</th>
                  <th>Module</th>
                </tr>
              </thead>
              <tbody>
                {BLIND_75.map((problem) => {
                  const ownerId = blindOwner.get(problem.slug);
                  const owner = ownerId ? getModule(ownerId) : undefined;
                  const done = ownerId
                    ? Boolean(moduleProgress(progress, ownerId).drills[problem.slug])
                    : false;
                  return (
                    <tr key={problem.slug} className={done ? 'is-done' : ''}>
                      <td data-label="Problem">
                        <a
                          href={leetcodeUrl(problem.slug)}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {problem.title}
                        </a>
                        {problem.premium ? <span className="chip">premium</span> : null}
                      </td>
                      <td
                        className="donecell"
                        data-label="Done"
                        aria-label={done ? 'Done' : 'Not done'}
                      >
                        {done ? '✓ done' : 'not yet'}
                      </td>
                      <td data-label="Difficulty">{problem.difficulty}</td>
                      <td data-label="Module">
                        {owner ? <Link to={`/module/${owner.id}`}>{owner.title}</Link> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollX>
        </>
      ) : null}

      {view === 'modules' ? (
        <ScrollX className="tablewrap table--stack__wrap" label="Modules">
          <table className="table--stack">
            <thead>
              <tr>
                <th>Module</th>
                <th>Source</th>
                <th>Your progress</th>
                <th>Questions</th>
                <th>Drills</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((courseModule) => {
                const summary = moduleStudySummary(
                  courseModule,
                  moduleProgress(progress, courseModule.id),
                );
                return (
                  <tr key={courseModule.id}>
                    <td data-label="Module">
                      <Link to={`/module/${courseModule.id}`}>{courseModule.title}</Link>
                    </td>
                    <td className="muted" data-label="Source">
                      {courseModule.source}
                    </td>
                    <td data-label="Progress">
                      <span className={`chip${summary.started ? ' chip--accent' : ''}`}>
                        {formatStudySummary(summary)}
                      </span>
                    </td>
                    <td data-label="Questions">
                      {BOOK_QUESTIONS.filter((q) => q.moduleId === courseModule.id).length}
                    </td>
                    <td data-label="Drills">
                      {courseModule.drills.length +
                        (courseModule.practice ? courseModule.practice.length : 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollX>
      ) : null}

      {view === 'visualgo' ? (
        <>
          <p className="lede">
            Every visualizer{' '}
            <a href="https://visualgo.net/en" target="_blank" rel="noreferrer noopener">
              VisuAlgo
            </a>{' '}
            (by Steven Halim et al.) currently offers, and which dojo module links to it - so
            "everything from VisuAlgo" is verifiable, not just claimed. Links only: dojo never
            copies or embeds VisuAlgo's visualizations.
          </p>
          <ScrollX className="tablewrap table--stack__wrap" label="VisuAlgo catalog">
            <table className="table--stack">
              <thead>
                <tr>
                  <th>Visualizer</th>
                  <th>Category</th>
                  <th>Dojo modules</th>
                </tr>
              </thead>
              <tbody>
                {VISUALGO_CATALOG.map((entry) => (
                  <tr key={entry.id}>
                    <td data-label="Visualizer">
                      <a href={entry.url} target="_blank" rel="noreferrer noopener">
                        {entry.title} ↗
                      </a>
                    </td>
                    <td className="muted" data-label="Category">
                      {entry.category}
                    </td>
                    <td data-label="Modules">
                      {entry.moduleIds.length > 0 ? (
                        entry.moduleIds.map((moduleId, index) => {
                          const owner = getModule(moduleId);
                          return (
                            <span key={moduleId}>
                              {index > 0 ? ', ' : ''}
                              {owner ? (
                                <Link to={`/module/${owner.id}`}>{owner.title}</Link>
                              ) : (
                                moduleId
                              )}
                            </span>
                          );
                        })
                      ) : (
                        <span className="muted">no matching module</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollX>
        </>
      ) : null}
    </div>
  );
}
