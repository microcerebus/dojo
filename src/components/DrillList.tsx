import type { DrillRef, PracticeTask } from '../content/types';
import { getProblem, leetcodeUrl } from '../data/problems';
import { toggleDrill } from '../lib/progress';
import { useProgressUpdate } from '../lib/store';

export function DrillList({
  moduleId,
  drills,
  practice,
  done,
}: {
  moduleId: string;
  drills: DrillRef[];
  practice?: PracticeTask[];
  done: Record<string, boolean>;
}) {
  const updateProgress = useProgressUpdate();
  const resolved = drills.flatMap((drill) => {
    const problem = getProblem(drill.slug);
    return problem ? [{ drill, problem }] : [];
  });
  // Blind 75 first, then by difficulty, so the highest-value work is on top.
  const order = { Easy: 0, Medium: 1, Hard: 2 };
  const sorted = [...resolved].sort((a, b) => {
    if (a.problem.blind75 !== b.problem.blind75) return a.problem.blind75 ? -1 : 1;
    return order[a.problem.difficulty] - order[b.problem.difficulty];
  });

  const completed = sorted.filter(({ drill }) => done[drill.slug]).length;
  const blind = sorted.filter(({ problem }) => problem.blind75);
  const blindDone = blind.filter(({ drill }) => done[drill.slug]).length;

  return (
    <div className="stack-4">
      {sorted.length > 0 ? (
        <>
          <div className="drills__summary">
            <span>
              {completed} of {sorted.length} done
            </span>
            {blind.length > 0 ? (
              <span className="chip chip--accent">
                Blind 75: {blindDone}/{blind.length}
              </span>
            ) : null}
          </div>

          <ul className="drills">
            {sorted.map(({ drill, problem }) => {
              const isDone = Boolean(done[drill.slug]);
              return (
                <li key={drill.slug} className={`drill${isDone ? ' is-done' : ''}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    className="drill__check"
                    onClick={() => updateProgress((p) => toggleDrill(p, moduleId, drill.slug))}
                    aria-label={`Mark ${problem.title} as ${isDone ? 'not done' : 'done'}`}
                  >
                    <span aria-hidden="true">{isDone ? '✓' : ''}</span>
                  </button>

                  {/* Title, note and chips all stack inside one full-width
                      column. Letting the chips share the title's line squeezed
                      the note to about twenty characters at 390px. */}
                  <div className="drill__body">
                    <a
                      className="drill__title"
                      href={leetcodeUrl(problem.slug)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {problem.title}
                      <span className="drill__ext" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                    {drill.note ? <p className="drill__note">{drill.note}</p> : null}
                    <div className="drill__tags">
                      {problem.blind75 ? <span className="chip chip--accent">B75</span> : null}
                      {problem.premium ? <span className="chip">premium</span> : null}
                      <span className={`chip chip--${difficultyTone(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {practice?.length ? (
        <section className="stack-4">
          <h3>Practice</h3>
          <ul className="drills">
            {practice.map((task) => {
              const key = `practice:${task.id}`;
              const isDone = Boolean(done[key]);
              return (
                <li key={task.id} className={`drill${isDone ? ' is-done' : ''}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    className="drill__check"
                    onClick={() => updateProgress((p) => toggleDrill(p, moduleId, key))}
                    aria-label={`Mark ${task.title} as ${isDone ? 'not done' : 'done'}`}
                  >
                    <span aria-hidden="true">{isDone ? '✓' : ''}</span>
                  </button>
                  <div className="drill__body">
                    <p className="drill__title drill__title--plain">{task.title}</p>
                    <p className="drill__note">{task.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function difficultyTone(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
  return difficulty === 'Easy' ? 'good' : difficulty === 'Medium' ? 'warn' : 'bad';
}
