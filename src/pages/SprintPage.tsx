import { Link } from 'react-router-dom';
import { MODULES, getModule } from '../content';
import { SPRINT_WEEKS, SCHEDULED_MODULE_IDS, UNSCHEDULED_NOTE, weekForDate } from '../data/sprint';
import { moduleCompletion, moduleProgress } from '../lib/progress';
import { useProgressState } from '../lib/store';
import { ProgressRing } from '../components/ProgressRing';

export function SprintPage() {
  const progress = useProgressState();
  const currentWeek = weekForDate(new Date());

  return (
    <div className="stack-6">
      <header className="pagehead">
        <p className="eyebrow">Aug 11 - Sep 14</p>
        <h1>Five-week sprint</h1>
        <p className="lede">
          One week per row. Read the modules listed, take their quizzes, then work the drill lists
          - Blind 75 problems first.
        </p>
      </header>

      <ol className="weeks">
        {SPRINT_WEEKS.map((week) => {
          const modules = week.moduleIds.flatMap((id) => {
            const found = getModule(id);
            return found ? [found] : [];
          });
          const completions = modules.map((courseModule) =>
            moduleCompletion(courseModule, moduleProgress(progress, courseModule.id)),
          );
          const average =
            completions.length === 0
              ? 0
              : completions.reduce((total, item) => total + item.overall, 0) / completions.length;
          const isCurrent = currentWeek?.id === week.id;

          return (
            <li key={week.id} className={`week${isCurrent ? ' is-current' : ''}`}>
              <div className="week__head">
                <div>
                  <p className="eyebrow">
                    {week.label} · {week.dateLabel}
                    {isCurrent ? ' · this week' : ''}
                  </p>
                  <h2>{week.focus}</h2>
                </div>
                <ProgressRing value={average} label={week.label} />
              </div>

              <p className="week__goal">{week.goal}</p>

              <ul className="week__modules">
                {modules.map((courseModule, index) => (
                  <li key={courseModule.id}>
                    <Link className="week__module" to={`/module/${courseModule.id}`}>
                      <span className="week__moduleTitle">{courseModule.title}</span>
                      <span className="week__moduleMeta">
                        {courseModule.status === 'outline' ? 'content coming · ' : ''}
                        {courseModule.drills.length} drills ·{' '}
                        {Math.round((completions[index]?.overall ?? 0) * 100)}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <section className="card stack-4">
        <h2>Unscheduled</h2>
        <p className="lede">{UNSCHEDULED_NOTE}</p>
        <ul className="floatlist">
          {MODULES.filter((courseModule) => !SCHEDULED_MODULE_IDS.has(courseModule.id)).map(
            (courseModule) => (
              <li key={courseModule.id}>
                <Link to={`/module/${courseModule.id}`}>{courseModule.title}</Link>
                <span className="floatlist__meta">{courseModule.source}</span>
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  );
}
