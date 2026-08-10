import type { CourseModule } from '../../types';

export const beforeTheInterview: CourseModule = {
  id: 'before-the-interview',
  title: 'Before the Interview',
  track: 'process',
  status: 'outline',
  source: 'Part IV',
  summary: 'Resume, referrals and a preparation schedule built on deliberate practice rather than problem volume.',
  estimatedMinutes: 20,
  concepts: [
    'Build demonstrable experience: substantial projects, ownership at work, open source',
    'Resume bullets in the shape "accomplished X by doing Y, producing measurable result Z"',
    'One page for most candidates; strongest evidence near the top; easy to scan in twenty seconds',
    'Remove anything you cannot defend in depth - every line is an invitation to be questioned',
    'List languages you would be happy to be interviewed in, and be honest about levels',
    'Referrals from people who genuinely know your work beat cold applications and name-dropping',
    'Make a dated plan covering fundamentals, problems, mock interviews and company research',
    'Deliberate practice beats volume: fewer problems, done properly, with the whole loop',
    'Revisit weak topics in spaced cycles instead of cramming once',
    'Practise on the medium the interview uses - paper, a shared doc, or a plain editor',
    'Schedule realistic mocks and ask for specific feedback on communication as well as correctness',
    'Prepare logistics, sleep, equipment and your own questions before the day',
  ],
  plannedAnimations: [
    'A spaced-repetition schedule laid over the five-week sprint, showing when each topic returns',
    'A resume bullet being rewritten from a duty into an accomplishment with a measured result',
  ],
  sections: [],
  quiz: [],
  drills: [],
  practice: [
    {
      id: 'bti-resume',
      title: 'Rewrite every resume bullet as accomplishment + method + result',
      detail:
        'Cut anything you could not talk about for five minutes. Add a number to at least half the bullets.',
    },
    {
      id: 'bti-schedule',
      title: 'Commit to the five-week schedule',
      detail:
        'Use the Sprint view in this app. Block the hours in a calendar now - unscheduled prep does not happen.',
    },
    {
      id: 'bti-referrals',
      title: 'List five people who could refer you',
      detail:
        'People who have actually seen your work. Ask directly, and give them a short paragraph they can paste.',
    },
  ],
};
