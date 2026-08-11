import type { CourseModule } from '../../types';

export const beforeTheInterview: CourseModule = {
  id: 'before-the-interview',
  title: 'Before the Interview',
  track: 'process',
  status: 'complete',
  source: 'Part IV',
  summary:
    'Resume, referrals and a preparation schedule built on deliberate practice rather than problem volume.',
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
  sections: [
    {
      id: 'experience',
      title: 'Getting the right experience',
      takeaway:
        'Everything reduces to two claims: you are smart, and you can code. Build evidence for both.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Without a good resume there is no interview, and without real experience there is no good resume. Screeners are looking for exactly what interviewers are looking for - that you are smart and that you can code - so every line should serve one of those two claims.',
        },
        {
          kind: 'bullets',
          items: [
            '**Take the classes with big projects** if you are still studying. Practical, real-world-shaped work is the closest thing to experience you can get before you have any.',
            '**Get an internship early.** The first one makes the second easier. Startups are often more flexible about when they will take you.',
            '**Start something.** A side project, a hackathon, an open-source contribution. What it is matters far less than that you built it - and initiative reads well on its own.',
            '**Shift your day job towards coding.** Without announcing that you are looking, ask for meatier projects using relevant technology. These become the bulk of a strong resume.',
            '**Use nights and weekends** if the day job cannot supply it. Few things impress an interviewer more than something you built because you wanted it to exist.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Think one job ahead',
          text: 'If you want to move into management eventually, start collecting leadership experience now, while you are still applying for engineering roles. The evidence has to exist before you need it.',
        },
        {
          kind: 'p',
          text: 'And on getting in the door: a referral from someone who has genuinely seen your work beats a cold application by a wide margin, and beats name-dropping someone who barely knows you by a wider one. It does not have to be a close friend - reaching out and expressing real interest is often enough for someone to pass your resume along. Make the ask specific, and give them a short paragraph they can paste.',
        },
      ],
    },
    {
      id: 'resume',
      title: 'Writing the resume',
      takeaway:
        'One page, scannable in twenty seconds, and every line defensible for five minutes.',
      audio: true,
      blocks: [
        {
          kind: 'callout',
          tone: 'key',
          title: 'One page, under ten years of experience',
          text: 'A screener spends about ten seconds. Restricting the page to your most impressive material guarantees they see it; adding more only competes with it. A long resume is not evidence of more experience - it is evidence of not prioritising.',
        },
        {
          kind: 'p',
          text: 'Include only the roles that make you a stronger candidate, not a complete employment history. Then write each bullet the same way.',
        },
        { kind: 'anim', animId: 'bti-bullet' },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Cut anything you cannot defend',
          text: 'Most interviewers treat everything on the page as fair game. A line you cannot discuss for five minutes is worse than no line at all, because it turns into a visible gap in the middle of an interview.',
        },
        {
          kind: 'p',
          text: '**Projects** are the fastest way to look more experienced, especially early in a career. Include your two to four most significant ones with what they were and what they used. Independent work generally reads better than coursework because it shows initiative. Do not list thirteen projects - the small ones dilute the big ones.',
        },
        {
          kind: 'p',
          text: '**Languages** are a judgement call. Listing everything you have ever touched is dangerous, because every one of them is now fair game. The best compromise is to list most of them with an honest level attached:',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'Languages: TypeScript (expert), Python (proficient), Go (prior experience)',
          caption:
            'Plain English beats "years of experience", which is unreadable - occasional use over ten years is not ten years.',
        },
        {
          kind: 'table',
          headers: ['Trap', 'Why it costs you'],
          rows: [
            [
              'Listing office software and IDEs',
              'Uses space without adding signal at technology companies',
            ],
            [
              'Flaunting specific language versions and flavours',
              'Reads as defining yourself by a language; some screeners bucket that negatively',
            ],
            [
              'A long list of certifications',
              'Same bias as above at many companies - occasionally a positive, so know your audience',
            ],
            [
              'Only one or two languages',
              'Suggests narrow exposure and possible difficulty picking up new things',
            ],
            [
              'Age, marital status, nationality, photo (US roles)',
              'Companies do not want it; it creates legal exposure for them',
            ],
            ['A typo', 'Some screeners discard on sight. Get a native speaker to proofread'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Diversify deliberately',
          text: 'This is career advice as much as resume advice. If you only know one language, learn one that is genuinely different - Python, C++ and Java teach you more between them than Python, Ruby and JavaScript do.',
        },
      ],
    },
    {
      id: 'the-plan',
      title: 'The preparation plan',
      takeaway: 'Dated, spaced, out loud, and on the medium the interview actually uses.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Preparation is not just interview questions. A realistic plan runs on four tracks at once: build things, learn the fundamentals, practise problems properly, and research your targets.',
        },
        { kind: 'anim', animId: 'bti-schedule' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Deliberate practice beats volume',
          text: 'Fifteen problems worked end to end - clarify, example, brute force, optimise, code on paper, test out loud - are worth more than a hundred solutions you read and nodded at. The whole loop, every time, is the point.',
        },
        {
          kind: 'steps',
          items: [
            '**Learn big O properly first.** Everything downstream depends on it, and it is the single most common gap in candidates who learned to program on the job.',
            '**Implement the core data structures from scratch, once.** Lists, stacks, queues, hash maps, trees, heaps, tries. It converts vocabulary into understanding faster than any number of problems.',
            '**Practise on the real medium.** Paper, a whiteboard, or a plain shared document. No autocomplete, no compiler, no test runner.',
            '**Keep a list of your mistakes**, not your solved problems. Off-by-one; forgot the empty case; coded before the algorithm was settled. Review it before every mock.',
            '**Do several mock interviews**, spread out, with someone else choosing the questions - and ask specifically for feedback on communication.',
            '**Revisit topics on a spacing schedule.** A topic learned once in week 1 and never revisited is gone by week 5.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Do not save the mocks for the end',
          text: 'A mock in week 2 is uncomfortable and extremely useful - it tells you what to fix while there is still time. A mock in the last week only tells you what you should have fixed.',
        },
        {
          kind: 'p',
          text: 'In the final week, taper. Re-read the technical and behavioural material, rehearse each of your stories once, do one last mock, and stop learning new topics. For a phone screen, sort out the headset and the shared editor in advance and have your notes to hand. Sleep, eat, and arrive early - the marginal problem you could have solved at midnight is worth much less than being awake.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Afterwards',
          text: 'Send a short thank-you note to your recruiter. If you have not heard back in a week, check in. If it is a no, ask when you can reapply and whether there is anything they would suggest working on - some companies will tell you, and it costs nothing to ask.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'bti-1',
      kind: 'concept',
      prompt: 'Which resume bullet is strongest?',
      options: [
        'Responsible for the search feature',
        'Cut search latency from 900ms to 120ms by rebuilding search on an inverted index, lifting search-led purchases 18%',
        'Expert in search technologies including Elasticsearch, Solr and Lucene',
        'Worked with a team of six on a high-traffic search platform',
      ],
      answerIndex: 1,
      explain:
        'Accomplished X, by doing Y, producing measurable result Z. The others describe a duty, a claim, or the team rather than you.',
    },
    {
      id: 'bti-2',
      kind: 'concept',
      prompt:
        'You have twelve years of experience and your resume runs to three pages. The likely reading is:',
      options: [
        'You have a lot of experience',
        'You have not prioritised - and a screener spending ten seconds may never reach your best material',
        'You are applying for a senior role',
        'Nothing - length is neutral',
      ],
      answerIndex: 1,
      explain:
        'Beyond about ten years, 1.5-2 pages can be justified. Length reads as an inability to select, and some screeners simply will not read it.',
    },
    {
      id: 'bti-3',
      kind: 'technique',
      prompt:
        'You worked with a technology briefly two years ago. Listing it on your resume is risky because:',
      options: [
        'Recruiters check dates',
        'Most interviewers treat everything on the page as fair game, so a line you cannot defend becomes a visible gap',
        'It makes the resume longer',
        'Two years is too recent',
      ],
      answerIndex: 1,
      explain:
        'If you cannot talk about it for five minutes, cut it - or list it with an honest level such as "prior experience".',
    },
    {
      id: 'bti-4',
      kind: 'concept',
      prompt: 'The best source of a referral is:',
      options: [
        'The most senior person you can reach',
        'Someone who has genuinely seen your work, even if you are not close',
        'Anyone who works at the company',
        'A recruiter on a professional network',
      ],
      answerIndex: 1,
      explain:
        'A referral is only worth what the referrer can say about you. Name-dropping someone who barely knows you adds nothing.',
    },
    {
      id: 'bti-5',
      kind: 'technique',
      prompt: 'Deliberate practice, in this context, means:',
      options: [
        'Solving as many problems as possible per week',
        'Fewer problems worked end to end - clarify, brute force, optimise, code on paper, test out loud',
        'Reading editorial solutions carefully',
        'Focusing only on your weakest topic',
      ],
      answerIndex: 1,
      explain:
        'The whole loop, every time. Reading a solution builds recognition; running the loop builds the skill actually being tested.',
    },
    {
      id: 'bti-6',
      kind: 'technique',
      prompt: 'Why revisit each topic in a later week rather than finishing it and moving on?',
      options: [
        'To fill the schedule',
        'Because a topic learned once and never revisited is gone by the time you interview - the second pass is where it sticks',
        'Because the topics are interdependent',
        'To keep the mocks varied',
      ],
      answerIndex: 1,
      explain:
        'Spaced revisits are short - re-solve two problems, reread your mistake list - and they are what makes week 1 still usable in week 5.',
    },
    {
      id: 'bti-7',
      kind: 'concept',
      prompt: 'When should your first mock interview happen in a five-week plan?',
      options: [
        'The final week, once you know the material',
        'Early - around week 2 - so you learn what to fix while there is still time to fix it',
        'Only after you have solved a hundred problems',
        'The day before the real interview',
      ],
      answerIndex: 1,
      explain:
        'A late mock only tells you what you should have fixed. An early one is uncomfortable and far more useful.',
    },
    {
      id: 'bti-8',
      kind: 'technique',
      prompt: 'Which practice detail most closely reproduces real interview conditions?',
      options: [
        'Using your usual IDE but disabling autocomplete',
        'Solving on paper or a plain shared document, out loud, against a clock',
        'Solving with the editorial open in another tab',
        'Solving harder problems than you expect to be asked',
      ],
      answerIndex: 1,
      explain:
        'The medium and the narration are exactly what breaks in the room. Practise those, not only the problems.',
    },
  ],
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
    {
      id: 'bti-mistakes',
      title: 'Start a mistake log today',
      detail:
        'One line per mistake, not per problem. Review it before every mock interview and on the morning of every real one.',
    },
  ],
};
