import { FlowSteps, Stage, type FlowStepSpec } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

const STAGES: { label: string; badge: string; detail: string }[] = [
  {
    label: 'Recruiter screen',
    badge: '20-30 min',
    detail:
      'Usually non-technical: background, what you are looking for, logistics. Your recruiter is the person who can advocate for you later - and sometimes push for a re-interview after a bad round. Be good to them.',
  },
  {
    label: 'Technical phone screen',
    badge: '1-2 rounds',
    detail:
      'Do not let the word "screening" fool you: an engineer asks real coding and algorithm questions, often in a shared document, and the bar can be as high as the onsite. Expect one or two of these.',
  },
  {
    label: 'Take-home or online assessment',
    badge: 'sometimes',
    detail:
      'Some companies add a homework problem or a timed coding assessment. Efficiency and code style are both graded here, and you can look things up - which means the bar is higher, not lower.',
  },
  {
    label: 'Onsite loop',
    badge: '3-6 rounds',
    detail:
      'A mix of coding, algorithms, design and behavioural, often with two different teams. Interviewers are frequently assigned different areas to probe, so the rounds can feel wildly inconsistent by design.',
  },
  {
    label: 'Lunch round',
    badge: 'often unscored',
    detail:
      'Usually not technical, and the interviewer often files no feedback. Treat it as your best chance to ask honest questions - while remembering that "usually" is not "never".',
  },
  {
    label: 'Written feedback',
    badge: 'independent',
    detail:
      'Interviewers write up before discussing, and often cannot see each other\'s notes until they have submitted. That is deliberate: it stops one opinion anchoring the rest, and it means each round starts from a blank slate.',
  },
  {
    label: 'The decision',
    badge: 'varies',
    detail:
      'Sometimes the interviewers decide together. Sometimes it goes to a hiring manager. Sometimes a hiring committee that never met you reads the packets and decides - in which case one strongly enthusiastic write-up can matter more than uniformly good ones.',
  },
  {
    label: 'Approval and offer',
    badge: 'days to weeks',
    detail:
      'Larger companies add compensation and executive approval stages, which is why a decision can take weeks. Most companies respond within about a week; if two pass, follow up politely.',
  },
];

const frames = [
  {
    caption:
      'Loops differ in the details and barely at all in the shape. Knowing the shape tells you what each stage is for and stops you reading meaning into normal delays.',
    detail: 'Confirm the specifics with your recruiter - that is what they are for.',
  },
  ...STAGES.map((stage, i) => ({
    caption: `${i + 1}. ${stage.label} - ${stage.detail}`,
    detail: stage.badge === 'independent' ? 'This is why each interview is genuinely a fresh start.' : `typically: ${stage.badge}`,
  })),
  {
    caption:
      'Two consequences worth internalising: every round is written up by someone who could not see the others, and the person who decides may never have met you. Consistency across rounds matters more than one spectacular answer.',
    detail: 'Also: interviewer warmth is not signal. Some are trained to stay neutral, and some are just like that.',
  },
];

function LoopFrame({ index }: { index: number }) {
  const step = Math.max(0, Math.min(index, frames.length - 1)) - 1;
  const steps: FlowStepSpec[] = STAGES.map((stage, i) => ({
    key: stage.label,
    label: stage.label,
    badge: stage.badge,
    ...(i === step ? { detail: stage.detail } : {}),
    state: i === step ? 'active' : step < 0 || step >= STAGES.length ? 'done' : i < step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const hiringLoop: AnimationSpec = fromFrames(
  {
    id: 'bts-loop',
    title: 'The hiring loop',
    blurb: 'Where feedback is written, and where the decision is actually made.',
  },
  frames,
  LoopFrame,
);

export const behindTheScenesAnimations: AnimationSpec[] = [hiringLoop];
