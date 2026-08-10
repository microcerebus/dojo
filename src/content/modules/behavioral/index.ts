import type { CourseModule } from '../../types';

export const behavioral: CourseModule = {
  id: 'behavioral',
  title: 'Behavioural Questions',
  track: 'process',
  status: 'complete',
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
  sections: [
    {
      id: 'the-grid',
      title: 'The story grid',
      takeaway: 'Build it once. Every behavioural question then becomes a lookup instead of an improvisation.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Behavioural questions exist to get to know you, to dig into your resume, and to ease you into the interview. They are entirely preparable, and almost nobody prepares them properly - which makes them cheap points.',
        },
        { kind: 'anim', animId: 'bq-grid' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Keywords, not scripts',
          text: 'Reduce each cell to two or three words. A grid you can hold in your head, or glance at on a page without being distracted, is worth far more than paragraphs you will half-remember under pressure.',
        },
        {
          kind: 'p',
          text: 'Read down the columns as well as across the rows. A thin column is a gap in your preparation, and the usual culprits are conflict and failure - the two questions you are most certain to be asked. A gap is not a reason to invent a story; it is a prompt to think harder about a real situation you have been downplaying.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Every resume line is a behavioural question waiting to happen',
          text: 'Pick two or three projects and master them: the hardest technical decision and why, the tradeoffs you accepted, what broke in production, and what you would do differently. Behavioural questions turn technical within about two follow-ups.',
        },
        {
          kind: 'p',
          text: 'Choose those deep projects carefully. The best ones had genuinely challenging components - not just "I learned a lot" - and you played a central role, ideally on the hard part, and you can go three levels deep without hand-waving. Expect scaling follow-ups too: what happens at ten times the traffic?',
        },
      ],
    },
    {
      id: 'answering',
      title: 'Answering well',
      takeaway: 'Nugget first, then situation, action and result - with most of the time on your own actions.',
      audio: true,
      blocks: [
        { kind: 'anim', animId: 'bq-sar' },
        {
          kind: 'table',
          headers: ['Instead of', 'Say'],
          rows: [
            ['"I did all the hard parts"', '"I owned the migration script and the rollback path" - specifics let the interviewer draw the flattering conclusion'],
            ['A ten-minute walk through your architecture', 'One sentence on impact, then "I can go into more detail if useful"'],
            ['"We decided…", "the team shipped…"', '"I proposed…", "I built…" - and "we" only where it genuinely was the team'],
            ['"It went well"', '"Latency dropped 40% and the on-call pages stopped" - a number, or at least a concrete change'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Specific is the antidote to arrogant',
          text: 'You need to sound impressive without sounding boastful, and the way through is specificity. Give the facts and let the interviewer form the interpretation. Claims invite scepticism; details invite follow-up questions.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Listen for how often you say "we"',
          text: 'This is the single most common failure, especially for people in senior or leadership roles who have been trained to credit their team. The interviewer walks away unable to tell what you did, and may conclude you did little. Assume every question is about your role, and answer to that.',
        },
        {
          kind: 'p',
          text: 'Explore the action. "I did three things. First, I…" is a small verbal trick that forces you into the depth interviewers are looking for, and it stops the answer collapsing into a summary. Two specific story types are worth rehearsing:',
        },
        {
          kind: 'bullets',
          items: [
            '**Failure.** No blame. What you got wrong, plainly, and the concrete thing you changed afterwards. A failure story with a villain is not a failure story.',
            '**Conflict.** Constructive disagreement with a resolution - ideally one where you changed your mind, or found out why the other person was behaving as they were. A story in which you were simply right teaches nobody anything.',
          ],
        },
        {
          kind: 'p',
          text: 'Then ask what the story says about you. A good conflict story might demonstrate initiative, empathy, compassion, humility and teamwork all at once. If the honest answer is "nothing", either rework the telling or pick a different story - and never state the trait out loud. "I made sure to call the client myself, because I knew he would want to hear it from me" shows empathy; "I am empathetic" undoes it.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Rehearse the structure, not the words',
          text: 'A memorised script sounds memorised, and it collapses the moment the question is phrased slightly differently. Rehearse the beats - nugget, situation, three actions, result - and let the sentences come out fresh.',
        },
      ],
    },
    {
      id: 'tell-me-about-yourself',
      title: '"So, tell me about yourself"',
      takeaway: 'Ninety seconds, chronological, with successes dropped in rather than announced.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Most interviews open with this, which makes it your interviewer\'s first impression - and it is entirely within your control. A chronological arc works for almost everybody.',
        },
        {
          kind: 'steps',
          items: [
            '**Current role, headline only.** One sentence: what you do and where.',
            '**Background.** Degree, early jobs, anything that explains how you got here.',
            '**The path since.** Each move, and *why* you made it. The reasons are the interesting part.',
            '**Current role, in detail.** What you own now, and what you have built there.',
            '**Outside work, if it helps.** Only if it is unusual, technical, or says something real about you.',
            '**Wrap up.** What you are looking for now, and why this company specifically.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Sprinkle in the evidence',
          text: 'Do not announce your achievements - drop them in. "A former manager recruited me to join her startup" shows you were good at the last job without claiming it. So does "I drove the launch of X". Awards, promotions, being recruited out, launches: work them into the narrative, not into a list.',
        },
        {
          kind: 'p',
          text: 'On hobbies: usually filler, occasionally valuable. Mention one if it is genuinely unusual and might spark a conversation, if it is technical and shows the same drive, or if it demonstrates something real - renovating your own house says you take on unfamiliar things and get your hands dirty. Skip the generic ones.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Answer the question asked',
          text: 'Asked how you handled a disagreement, do not start with three minutes of company history. Answer first, then add the context you need. This applies to every behavioural question, and it is the fastest way to sound like someone who listens.',
        },
        {
          kind: 'p',
          text: 'Asked about weaknesses, give a real one - "I work too hard" reads as arrogance or an inability to self-assess. Name a genuine weakness and the concrete thing you do about it: "I am not naturally detailed, which is good for shipping and bad for accuracy, so I always get someone to check my work before it goes out."',
        },
      ],
    },
    {
      id: 'your-questions',
      title: 'Your questions for them',
      takeaway: 'Three kinds, prepared in advance, specific to this team. They are scored whether or not anyone admits it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Almost every interview ends with "any questions for me?", and the quality of yours factors into the decision - consciously or otherwise. Walk in with several, because a few will get answered before you can ask them.',
        },
        {
          kind: 'table',
          headers: ['Kind', 'Purpose', 'Example'],
          rows: [
            ['Genuine', 'Things you actually need to know to decide', '"How does planning work on this team? What does the on-call rotation look like?"'],
            ['Genuine', 'What the day-to-day is really like', '"What brought you here, and what has been the most challenging part?"'],
            ['Insightful', 'Demonstrate that you understand the technology', '"I saw you moved to X - how do you handle Y? Most teams I have seen hit Z."'],
            ['Passion', 'Show you want to learn and will contribute', '"I am interested in scalability - what opportunities are there here to go deeper on it?"'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Specific beats generic, every time',
          text: '"What does the on-call rotation look like?" tells an interviewer that you have run systems in production. "What is the culture like?" tells them nothing, and could have been asked of any company on earth. The insightful ones require real research beforehand - which is the point.',
        },
        {
          kind: 'p',
          text: 'Two closing notes. Credible beats flawless: an answer with real tradeoffs, uncertainty and reflection lands far better than a polished non-answer, and interviewers have heard the polished version many times. And the lunch round, which usually carries no formal feedback, is the best place in the day for the questions you actually want honest answers to.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'bq-1',
      kind: 'technique',
      prompt: 'What is the story grid for?',
      options: [
        'Writing out full answers to memorise',
        'Mapping your projects against recurring themes so any behavioural question becomes a lookup, and so gaps are visible',
        'Tracking which companies asked which questions',
        'Deciding which projects to put on your resume',
      ],
      answerIndex: 1,
      explain:
        'Keywords per cell, not scripts. Reading down the columns shows which themes you have no story for.',
    },
    {
      id: 'bq-2',
      kind: 'concept',
      prompt: 'In a situation-action-result answer, which part should take the most time?',
      options: ['Situation', 'Action', 'Result', 'They should be equal'],
      answerIndex: 1,
      explain:
        'The action is what tells the interviewer about you. Most people invert this and spend the time on setup.',
    },
    {
      id: 'bq-3',
      kind: 'technique',
      prompt: 'You keep saying "we" when describing a project you led. The risk is:',
      options: [
        'You sound arrogant',
        'The interviewer cannot tell what you personally did and may conclude it was little',
        'It suggests the project failed',
        'It makes the answer too long',
      ],
      answerIndex: 1,
      explain:
        'Say "I" for your contribution and "we" for the team\'s. Assume every question is about your role.',
    },
    {
      id: 'bq-4',
      kind: 'concept',
      prompt: 'How do you sound impressive without sounding arrogant?',
      options: [
        'Be modest and understate everything',
        'Be specific - give the facts and let the interviewer draw the conclusion',
        'Quote praise from your manager',
        'Focus on the team’s achievements instead',
      ],
      answerIndex: 1,
      explain:
        '"I owned the migration script and the rollback path" beats "I did all the hard parts". Claims invite scepticism; details invite follow-ups.',
    },
    {
      id: 'bq-5',
      kind: 'concept',
      prompt: 'Which failure story is strongest?',
      options: [
        'One where the root cause was a teammate’s mistake',
        'One where you state plainly what you got wrong and the concrete change you made afterwards',
        'One where the failure was outside your control',
        'One where nothing was really lost',
      ],
      answerIndex: 1,
      explain:
        'A failure story with a villain is not a failure story. The change afterwards is what the question is actually asking about.',
    },
    {
      id: 'bq-6',
      kind: 'technique',
      prompt: '"Tell me about yourself" is best answered with:',
      options: [
        'A full walk through your resume, role by role',
        'A 90-second chronological arc ending with what you want now and why this company, with successes dropped in rather than announced',
        'Your strongest technical project in depth',
        'Your hobbies, to build rapport first',
      ],
      answerIndex: 1,
      explain:
        'Current role headline, background, the path and why you took it, current role in detail, then the wrap-up.',
    },
    {
      id: 'bq-7',
      kind: 'concept',
      prompt: 'Asked about your greatest weakness, the worst answer is:',
      options: [
        '"I sometimes miss details, so I always have someone check my work"',
        '"I work too hard"',
        '"I have struggled to delegate, and here is what I changed"',
        '"I go too deep on problems, so I now timebox investigations"',
      ],
      answerIndex: 1,
      explain:
        'A non-weakness reads as arrogance or an inability to self-assess. Give a real one plus what you do about it.',
    },
    {
      id: 'bq-8',
      kind: 'technique',
      prompt: 'Which question for the interviewer is strongest?',
      options: [
        '"What is the culture like?"',
        '"What does the on-call rotation look like, and how does planning work on this team?"',
        '"What are the growth prospects?"',
        '"Do you enjoy working here?"',
      ],
      answerIndex: 1,
      explain:
        'Specific and answerable only by this team. It also signals that you have run systems in production.',
    },
    {
      id: 'bq-9',
      kind: 'concept',
      prompt: 'Rehearsing behavioural answers word for word is discouraged because:',
      options: [
        'It takes too long',
        'A memorised script sounds memorised and collapses when the question is phrased differently',
        'Interviewers can tell you have read a book',
        'It makes answers too short',
      ],
      answerIndex: 1,
      explain:
        'Rehearse the beats - nugget, situation, three actions, result - and let the sentences come out fresh.',
    },
    {
      id: 'bq-10',
      kind: 'technique',
      prompt: 'Why prepare technical depth on every project you list, not just your favourite?',
      options: [
        'Interviewers pick a project at random',
        'Behavioural questions turn technical within a couple of follow-ups, and anything on your resume is fair game',
        'It helps with the coding rounds',
        'Recruiters ask about them in the phone screen',
      ],
      answerIndex: 1,
      explain:
        'Expect the hardest decision, the tradeoffs, what broke in production, and what you would do differently - for each one.',
    },
  ],
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
    {
      id: 'bq-attributes',
      title: 'Audit what each story says about you',
      detail:
        'For every story in the grid, write the personality attribute it demonstrates - initiative, empathy, humility, ownership. If the honest answer is "none", rework the telling or replace the story.',
    },
  ],
};
