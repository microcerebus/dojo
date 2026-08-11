import { Caption, Matrix, Readout, Stage, type CellSpec } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

const ROUNDS = [
  { key: 'C', label: 'coding & algorithms' },
  { key: 'D', label: 'design & architecture' },
  { key: 'T', label: 'testing' },
  { key: 'B', label: 'behavioural & leadership' },
  { key: 'X', label: 'domain & product' },
];

const ROLES: { name: string; weights: number[]; note: string }[] = [
  {
    name: 'New grad SWE',
    weights: [3, 1, 1, 1, 0],
    note: 'Almost entirely problem-solving. Design questions still appear and are graded against your experience level, so attempt them rather than declining.',
  },
  {
    name: 'Experienced SWE',
    weights: [3, 3, 1, 2, 2],
    note: 'Coding does not go away - only slightly less of it. What is added is architecture, and much deeper expectations on "the hardest bug you have faced" and everything on your resume.',
  },
  {
    name: 'SDET / tester',
    weights: [3, 1, 3, 2, 1],
    note: 'Double the preparation: strong coding plus a rigorous risk-based testing mindset. The commonest rejection reason for testers is coding, not testing.',
  },
  {
    name: 'Product / program',
    weights: [1, 2, 2, 3, 3],
    note: 'Handling ambiguity, customer focus, prioritisation, metrics, and explaining technical things at several levels. Some PM roles still test coding - ask.',
  },
  {
    name: 'Lead / manager',
    weights: [2, 3, 1, 3, 2],
    note: 'Coding is still expected where you will code. Added: prioritisation, hiring and coaching stories, conflict, and demonstrable "gets things done".',
  },
  {
    name: 'Startup',
    weights: [3, 2, 1, 2, 3],
    note: 'Personality fit, hitting the ground running in a specific stack, and breadth. Expect deep questions about what you have actually shipped.',
  },
];

const GLYPH = ['·', '●', '●●', '●●●'];

interface RoleFrame {
  rows: number;
  role: number | null;
  caption: string;
  detail: string;
}

const roleFrames: RoleFrame[] = [
  {
    rows: 0,
    role: null,
    caption:
      'The same loop is weighted differently for different roles. Preparing as though every role were a generic software engineering role wastes the half of your time that should have gone somewhere else.',
    detail: 'Rows fill in as you step. More dots means more of your preparation belongs there.',
  },
  ...ROLES.map((role, i) => ({
    rows: i + 1,
    role: i,
    caption: `${role.name}: ${role.note}`,
    detail: ROUNDS.map((round, j) => `${round.label} ${GLYPH[role.weights[j]]}`).join(' · '),
  })),
  {
    rows: ROLES.length,
    role: null,
    caption:
      'Two things hold across every row. Fundamentals never disappear entirely - nobody gets a pass on coding. And the behavioural column only grows as you become more senior.',
    detail: 'Tailor the depth to the role rather than presenting one generic interview identity.',
  },
];

function RoleFrame({ index }: { index: number }) {
  const frame = roleFrames[Math.max(0, Math.min(index, roleFrames.length - 1))];
  const rows: CellSpec[][] = ROLES.map((role, row) =>
    ROUNDS.map((round, col) => ({
      key: `${role.name}-${round.key}`,
      label: row < frame.rows ? GLYPH[role.weights[col]] : '',
      state:
        row === frame.role
          ? ('active' as const)
          : row < frame.rows
            ? ('done' as const)
            : ('idle' as const),
    })),
  );
  return (
    <Stage tall>
      <Matrix rows={rows} colLabels={ROUNDS.map((round) => round.key)} />
      <Caption>{ROUNDS.map((round) => `${round.key} ${round.label}`).join(' · ')}</Caption>
      <Readout
        items={[
          { key: 'r', label: 'role', value: frame.role === null ? 'all' : ROLES[frame.role].name },
        ]}
      />
    </Stage>
  );
}

export const roleWeights: AnimationSpec = fromFrames(
  {
    id: 'ss-weights',
    title: 'Where your prep time should go',
    blurb:
      'Role down one axis, kind of round across the other. Prepare to the weighting, not the average.',
  },
  roleFrames,
  RoleFrame,
);

export const specialSituationsAnimations: AnimationSpec[] = [roleWeights];
