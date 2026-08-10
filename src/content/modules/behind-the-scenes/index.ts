import type { CourseModule } from '../../types';

export const behindTheScenes: CourseModule = {
  id: 'behind-the-scenes',
  title: 'Behind the Scenes',
  track: 'process',
  status: 'outline',
  source: 'Part II',
  summary:
    'How loops are structured and how decisions get made after you leave the room. The company specifics are dated; the mechanics are not.',
  estimatedMinutes: 15,
  concepts: [
    'The typical loop: recruiter screen, phone/technical screen, then an onsite of several interviews',
    'Company profiles in the book (Microsoft, Amazon, Google, Apple, Facebook, Palantir) are historical - verify the current format with your recruiter',
    'Independent interviewers whose written feedback is combined in a committee or hiring-manager decision',
    'Every interaction can inform feedback, including lunch and informal conversation',
    'Loops deliberately mix coding, design, behavioural and domain depth',
    'Consistency matters: one excellent answer rarely offsets repeated weak signals',
    'Collaboration and receptiveness are assessed - teams are asking what it is like to solve problems with you',
    'Interviewer affect is not signal; neutral or discouraging behaviour is often deliberate',
    'Ask the recruiter what to expect: interview types, coding environment, whether it is a whiteboard or a laptop',
    'Use public information for context, but confirm logistics directly with recruiting',
  ],
  plannedAnimations: [
    'A hiring loop as a pipeline, showing where feedback is written and where the decision is made',
  ],
  sections: [],
  quiz: [],
  drills: [],
  practice: [
    {
      id: 'bts-recruiter-questions',
      title: 'Write your recruiter question list',
      detail:
        'Format of each round, coding environment, languages accepted, whether system design is included, level being interviewed for, and timeline. Send it before the first round.',
    },
    {
      id: 'bts-research',
      title: 'Research the current loop for each target company',
      detail:
        'Recent candidate reports beat any book. Note the differences and adjust which modules you prioritise for each.',
    },
  ],
};
