import { Link } from 'react-router-dom';
import { MODULES, TRACKS } from '../content';
import type { CourseModule } from '../content/types';
import { moduleCompletion, moduleProgress } from '../lib/progress';
import { useProgressState } from '../lib/store';
import { ProgressBars, ProgressRing } from '../components/ProgressRing';
import { SPRINT_WEEKS } from '../data/sprint';
import { BLIND_75, getProblem } from '../data/problems';

export function HomePage() {
  const progress = useProgressState();

  const overall = MODULES.map((courseModule) =>
    moduleCompletion(courseModule, moduleProgress(progress, courseModule.id)),
  );
  const started = overall.filter((completion) => completion.started).length;
  const averageOverall =
    overall.reduce((total, completion) => total + completion.overall, 0) / MODULES.length;

  const blindDone = BLIND_75.filter((problem) => {
    const owner = MODULES.find((courseModule) =>
      courseModule.drills.some((drill) => drill.slug === problem.slug),
    );
    return owner ? moduleProgress(progress, owner.id).drills[problem.slug] : false;
  }).length;

  return (
    <div className="stack-6">
      <header className="pagehead">
        <p className="eyebrow">Cracking the Coding Interview, without the book</p>
        <h1>Curriculum</h1>
        <p className="lede">
          {MODULES.length} modules covering all 17 chapters plus the process and advanced-topics
          material. Read the lesson, step the animations, take the quiz, then drill.
        </p>
      </header>

      <section className="statrow">
        <StatCard label="Modules started" value={`${started}/${MODULES.length}`} />
        <StatCard label="Course progress" value={`${Math.round(averageOverall * 100)}%`} />
        <StatCard label="Blind 75 done" value={`${blindDone}/75`} />
        <StatCard label="Sprint weeks" value={`${SPRINT_WEEKS.length}`} to="/sprint" />
      </section>

      {TRACKS.map((track) => {
        const modules = MODULES.filter((courseModule) => courseModule.track === track.id);
        if (modules.length === 0) return null;
        return (
          <section key={track.id} className="stack-4">
            <div className="trackhead">
              <h2>{track.label}</h2>
              <p className="lede">{track.blurb}</p>
            </div>
            <ul className="modulegrid">
              {modules.map((courseModule) => (
                <li key={courseModule.id}>
                  <ModuleCard courseModule={courseModule} progressState={progress} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, to }: { label: string; value: string; to?: string }) {
  const body = (
    <>
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </>
  );
  return to ? (
    <Link className="stat stat--link" to={to}>
      {body}
    </Link>
  ) : (
    <div className="stat">{body}</div>
  );
}

function ModuleCard({
  courseModule,
  progressState,
}: {
  courseModule: CourseModule;
  progressState: ReturnType<typeof useProgressState>;
}) {
  const moduleState = moduleProgress(progressState, courseModule.id);
  const completion = moduleCompletion(courseModule, moduleState);
  const blindCount = courseModule.drills.filter((drill) => getProblem(drill.slug)?.blind75).length;

  return (
    <Link className="modulecard" to={`/module/${courseModule.id}`}>
      <div className="modulecard__top">
        <div className="modulecard__heading">
          <h3>{courseModule.title}</h3>
          <p className="modulecard__source">{courseModule.source}</p>
        </div>
        <ProgressRing value={completion.overall} label={courseModule.title} />
      </div>

      <p className="modulecard__summary">{courseModule.summary}</p>

      <ProgressBars lesson={completion.lesson} quiz={completion.quiz} drills={completion.drills} />

      <div className="modulecard__tags">
        {courseModule.status === 'outline' ? (
          <span className="chip">content coming</span>
        ) : (
          <span className="chip chip--good">lesson ready</span>
        )}
        <span className="chip">{courseModule.estimatedMinutes} min</span>
        {blindCount > 0 ? <span className="chip chip--accent">{blindCount} × B75</span> : null}
      </div>
    </Link>
  );
}
