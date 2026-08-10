import type { CourseModule } from '../../types';

export const behavioral: CourseModule = {
  id: 'behavioral',
  title: 'Behavioural Questions',
  track: 'process',
  status: 'outline',
  source: 'Part V',
  summary:
    'Build a story grid once, then answer any behavioural prompt from it with structure and specifics.',
  estimatedMinutes: 30,
  concepts: [
    'The story grid: your projects down one axis, themes across the other',
    'Themes to cover: leadership, failure, conflict, biggest success, hardest problem, what you learned, why this company',
    'Situation, task, action, result - with most of the time spent on your own actions',
    'Say "I" for your contribution and "we" for the team\'s, and be able to separate them',
    'Quantify outcomes wherever you can',
    'Prepare technical depth for every project on your resume - behavioural questions turn technical fast',
    'Failure stories: no blame, a clear account of what you got wrong, and the concrete change afterwards',
    'Conflict stories: constructive disagreement and a resolution, not a story where you were simply right',
    '"Tell me about yourself": a concise arc - where you started, what you built, why you are here now',
    'Answer the question asked before adding context',
    'Credible beats flawless - real tradeoffs and reflection land better than a polished non-answer',
    'Rehearse the structure of each story, never a word-for-word script',
    'Prepare questions for the interviewer that show genuine interest in the work',
  ],
  plannedAnimations: [
    'The story grid filling in, showing which stories can cover more than one theme',
    'One story restructured into situation/task/action/result, with the time budget for each part',
  ],
  sections: [],
  quiz: [],
  drills: [],
  practice: [
    {
      id: 'bq-grid',
      title: 'Build the story grid',
      detail:
        'Five projects down the side; leadership, failure, conflict, success, hardest problem, what you learned across the top. Fill every cell you can with one line. Gaps tell you which stories to develop.',
    },
    {
      id: 'bq-intro',
      title: 'Write and time your 90-second introduction',
      detail:
        'Where you started, the two or three things you have built that matter, what you are looking for now. Say it out loud until it stops sounding recited.',
    },
    {
      id: 'bq-depth',
      title: 'Prepare technical depth for every resume line',
      detail:
        'For each project: the hardest technical decision, what you would change, and what broke in production. Assume you will be asked all three.',
    },
    {
      id: 'bq-questions',
      title: 'Write six questions for your interviewers',
      detail:
        'Specific to the team and the work. "What does the on-call rotation look like?" beats "what is the culture like?".',
    },
  ],
};
