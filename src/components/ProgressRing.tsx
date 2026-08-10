export function ProgressRing({
  value,
  size = 44,
  label,
}: {
  /** 0..1 */
  value: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const percent = Math.round(clamped * 100);
  return (
    <div
      className={`ring${percent === 100 ? ' is-complete' : ''}`}
      style={{
        ['--ring-value' as string]: String(clamped),
        ['--ring-size' as string]: `${size}px`,
      }}
      role="img"
      aria-label={`${label ? `${label}: ` : ''}${percent}% complete`}
    >
      <span className="ring__label" aria-hidden="true">
        {percent}
      </span>
    </div>
  );
}

/** Three thin bars: lesson, quiz, drills. Used on module cards. */
export function ProgressBars({
  lesson,
  quiz,
  drills,
}: {
  lesson: number;
  quiz: number;
  drills: number;
}) {
  const parts = [
    { key: 'lesson', label: 'Lesson', value: lesson },
    { key: 'quiz', label: 'Quiz', value: quiz },
    { key: 'drills', label: 'Drills', value: drills },
  ];
  return (
    <ul className="bars">
      {parts.map((part) => (
        <li key={part.key} className="bars__item">
          <span className="bars__label">{part.label}</span>
          <span
            className="bars__track"
            role="img"
            aria-label={`${part.label} ${Math.round(part.value * 100)}%`}
          >
            <span
              className="bars__fill"
              style={{ transform: `scaleX(${Math.max(0, Math.min(1, part.value))})` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
