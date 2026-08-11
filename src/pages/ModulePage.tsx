import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getModule } from '../content';
import { moduleCompletion, moduleProgress, setSectionRead } from '../lib/progress';
import { useProgressState, useProgressUpdate } from '../lib/store';
import { Blocks } from '../components/Blocks';
import { AudioBite } from '../components/AudioBite';
import { Quiz } from '../components/Quiz';
import { DrillList } from '../components/DrillList';
import { ProgressRing } from '../components/ProgressRing';
import { VisualizerRow } from '../components/VisualizerRow';
import { NotFoundPage } from './NotFoundPage';

type Tab = 'lesson' | 'quiz' | 'drills';

export function ModulePage() {
  const { moduleId = '' } = useParams();
  // Keyed so navigating between modules remounts with fresh tab/section state
  // instead of resetting it from an effect.
  return <ModuleView key={moduleId} moduleId={moduleId} />;
}

function ModuleView({ moduleId }: { moduleId: string }) {
  const courseModule = getModule(moduleId);
  const progress = useProgressState();
  const updateProgress = useProgressUpdate();
  const [tab, setTab] = useState<Tab>('lesson');
  const [sectionIndex, setSectionIndex] = useState(0);

  const sectionCount = courseModule?.sections.length ?? 0;

  // Arrow keys move between lesson sections, which is the requested keyboard
  // navigation. Ignored while typing or while an animation has focus.
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (tab !== 'lesson' || sectionCount === 0) return;
      const target = event.target as HTMLElement | null;
      if (target && target.closest('.anim__stage, input, textarea, [contenteditable]')) return;
      if (event.key === 'ArrowRight' || event.key === 'j') {
        setSectionIndex((index) => Math.min(index + 1, sectionCount - 1));
      } else if (event.key === 'ArrowLeft' || event.key === 'k') {
        setSectionIndex((index) => Math.max(index - 1, 0));
      }
    },
    [tab, sectionCount],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Reading a section marks it read; the ring is then an honest record of what
  // has actually been on screen.
  const section = courseModule?.sections[sectionIndex];
  useEffect(() => {
    if (!courseModule || !section) return;
    updateProgress((current) => setSectionRead(current, courseModule.id, section.id, true));
  }, [courseModule, section, updateProgress]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sectionIndex, tab]);

  if (!courseModule) return <NotFoundPage />;

  const moduleState = moduleProgress(progress, courseModule.id);
  const completion = moduleCompletion(courseModule, moduleState);
  const isOutline = courseModule.status === 'outline';

  return (
    <div className="stack-5">
      <p className="crumb">
        <Link to="/">← Curriculum</Link>
      </p>

      <header className="modulehead">
        <div className="modulehead__text">
          <p className="eyebrow">
            {courseModule.source}
            {isOutline ? ' · content coming' : ''}
          </p>
          <h1>{courseModule.title}</h1>
          <p className="lede">{courseModule.summary}</p>
        </div>
        <ProgressRing value={completion.overall} size={56} label={courseModule.title} />
      </header>

      <div className="tabs" role="tablist" aria-label="Module sections">
        {(['lesson', 'quiz', 'drills'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={`tabs__tab${tab === value ? ' is-active' : ''}`}
            onClick={() => setTab(value)}
          >
            {value === 'lesson' ? 'Lesson' : value === 'quiz' ? 'Quiz' : 'Drills'}
          </button>
        ))}
      </div>

      {tab === 'lesson' ? (
        <div className="stack-4">
          <VisualizerRow visualizers={courseModule.visualizers} />
          {isOutline ? (
            <OutlineView courseModule={courseModule} />
          ) : (
            <LessonView
              moduleId={courseModule.id}
              sectionIndex={sectionIndex}
              onNavigate={setSectionIndex}
              sections={courseModule.sections}
              readSections={moduleState.readSections}
            />
          )}
        </div>
      ) : null}

      {tab === 'quiz' ? (
        <Quiz
          moduleId={courseModule.id}
          questions={courseModule.quiz}
          best={moduleState.quizBest}
        />
      ) : null}

      {tab === 'drills' ? (
        <DrillList
          moduleId={courseModule.id}
          drills={courseModule.drills}
          {...(courseModule.practice ? { practice: courseModule.practice } : {})}
          done={moduleState.drills}
        />
      ) : null}
    </div>
  );
}

function LessonView({
  moduleId,
  sections,
  sectionIndex,
  onNavigate,
  readSections,
}: {
  moduleId: string;
  sections: NonNullable<ReturnType<typeof getModule>>['sections'];
  sectionIndex: number;
  onNavigate: (index: number) => void;
  readSections: string[];
}) {
  const section = sections[sectionIndex];
  if (!section) return null;

  return (
    <div className="lesson">
      <nav className="sectionrail" aria-label="Lesson sections">
        <ol>
          {sections.map((candidate, index) => (
            <li key={candidate.id}>
              <button
                type="button"
                className={`sectionrail__item${index === sectionIndex ? ' is-current' : ''}${
                  readSections.includes(candidate.id) ? ' is-read' : ''
                }`}
                onClick={() => onNavigate(index)}
              >
                <span className="sectionrail__num">{index + 1}</span>
                <span className="sectionrail__title">{candidate.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <article className="lesson__body prose">
        <header className="lesson__head">
          <h2>{section.title}</h2>
          <p className="lesson__takeaway">{section.takeaway}</p>
        </header>

        {section.audio ? (
          <AudioBite moduleId={moduleId} sectionId={section.id} title={section.title} />
        ) : null}

        <Blocks blocks={section.blocks} />

        <nav className="lesson__nav" aria-label="Section navigation">
          <button
            type="button"
            className="btn"
            onClick={() => onNavigate(sectionIndex - 1)}
            disabled={sectionIndex === 0}
          >
            ← Previous
          </button>
          <span className="lesson__navCount">
            {sectionIndex + 1} / {sections.length}
          </span>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate(sectionIndex + 1)}
            disabled={sectionIndex === sections.length - 1}
          >
            Next →
          </button>
        </nav>
        <p className="lesson__hint">Tip: ← and → move between sections.</p>
      </article>
    </div>
  );
}

function OutlineView({
  courseModule,
}: {
  courseModule: NonNullable<ReturnType<typeof getModule>>;
}) {
  return (
    <div className="stack-4">
      <div className="card notice">
        <p className="notice__title">Lesson and animations are still being written.</p>
        <p>
          Everything this module will teach is listed below, and the drill list is already
          complete - so you can start practising now and read the lesson when it lands.
        </p>
      </div>

      <section className="card stack-4">
        <h2>What this module covers</h2>
        <ul className="lesson__list">
          {courseModule.concepts.map((concept) => (
            <li key={concept}>{concept}</li>
          ))}
        </ul>
      </section>

      {courseModule.plannedAnimations?.length ? (
        <section className="card stack-4">
          <h2>Planned animations</h2>
          <ul className="lesson__list">
            {courseModule.plannedAnimations.map((animation) => (
              <li key={animation}>{animation}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
