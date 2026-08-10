import type { CourseModule } from '../../types';

export const interviewProcess: CourseModule = {
  id: 'interview-process',
  title: 'The Interview Process',
  track: 'process',
  status: 'outline',
  source: 'Part I',
  summary: 'What the interview is actually measuring, and how that should change your behaviour in the room.',
  estimatedMinutes: 15,
  concepts: [
    'The interview samples how you reason, communicate and code - it is not a trivia test',
    'Questions are chosen to be ambiguous on purpose; clarifying is part of the answer',
    'State your assumptions about inputs, constraints and available APIs',
    'Talk through alternatives and tradeoffs so partial progress stays visible',
    'A mistake is not fatal: identify it, explain it, correct it cleanly',
    'Take hints and build on them - resisting help to look independent reads badly',
    'Use the language you write correct code fastest in, unless the role dictates otherwise',
    'Difficulty varies, so you are judged on the whole interaction relative to a hiring bar',
    'Demonstrate testing and complexity analysis without being asked',
    'Practise under real conditions: aloud, on paper or a plain editor, against a clock',
  ],
  plannedAnimations: [
    'The evaluation axes an interviewer actually scores: analytical, coding, communication, experience',
    'A timeline of a 45-minute interview showing where the minutes should go',
  ],
  sections: [],
  quiz: [],
  drills: [],
  practice: [
    {
      id: 'ip-mock',
      title: 'Do one timed mock per week from now to Sep 15',
      detail:
        'Full 45 minutes, out loud, no IDE assistance, someone else picking the question. Ask specifically for feedback on communication, not just correctness.',
    },
    {
      id: 'ip-narrate',
      title: 'Practise narrating while you solve',
      detail:
        'Solve every drill this month out loud. Silence is the single most common thing that sinks otherwise strong candidates.',
    },
  ],
};
