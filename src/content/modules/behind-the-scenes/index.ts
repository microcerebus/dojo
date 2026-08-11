import type { CourseModule } from '../../types';

export const behindTheScenes: CourseModule = {
  id: 'behind-the-scenes',
  title: 'Behind the Scenes',
  track: 'process',
  status: 'complete',
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
  sections: [
    {
      id: 'the-loop',
      title: 'The shape of a loop',
      takeaway:
        'Screen, onsite, independent written feedback, then a decision made by people you may never meet.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Companies interview in remarkably similar ways. The names differ, the number of rounds differs, but the pipeline is the same - and knowing it stops you inventing meaning for things that are just how the machine works.',
        },
        { kind: 'anim', animId: 'bts-loop' },
        {
          kind: 'callout',
          tone: 'warn',
          title: '"Screening" interviews are not screening',
          text: 'A phone screen conducted by an engineer asks real coding questions and can hold the same bar as the onsite. If you are unsure whether a round will be technical, ask the recruiting coordinator what role your interviewer holds. An engineer means a technical interview.',
        },
        {
          kind: 'p',
          text: "Two structural facts change how you should behave. Interviewers write up their feedback before comparing notes, and often cannot see anyone else's until they have filed their own - so **every round genuinely starts from a blank slate**, and a bad first interview does not doom the rest. And the people who decide are frequently not the people who met you; they are reading write-ups. What survives that translation is evidence: what you built, what you said, what you got to.",
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Consistency beats a single peak',
          text: 'A packet of solid rounds with one outstanding one generally beats uniformly decent. A packet with one outstanding round and two weak ones generally loses. Nobody is averaging your best answer with your worst - they are asking whether the evidence supports a hire.',
        },
        {
          kind: 'p',
          text: 'On timing: most companies respond within about a week, some the same day, some take a month because of extra committee and approval stages. If a week passes, a polite check-in is appropriate. Recruiters get busy and forget, and silence is not a rejection - almost every large company tells candidates once a decision is final.',
        },
      ],
    },
    {
      id: 'variations',
      title: 'What varies, and what it means',
      takeaway: 'The company-specific rituals are dated. The patterns behind them are still live.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Published company profiles - including the ones in the sixth edition of the book - are historical. Formats change, and the specific rituals below may or may not survive at any given company. What is worth keeping is the *pattern* each one represents, because you will meet all of these under some other name.',
        },
        {
          kind: 'table',
          headers: ['Pattern', 'Where it was documented', 'What it means for you'],
          rows: [
            [
              'A dedicated bar-keeper from outside the team, with veto power',
              'Amazon\'s "bar raiser"',
              'One round may feel much harder and much less related to the team. Struggling in it does not mean failing it - it is graded against its own population.',
            ],
            [
              'A hiring committee that never met you',
              'Google',
              'Your interviewers are writing evidence, not verdicts. Enthusiasm in one write-up can carry a packet further than uniform mid scores.',
            ],
            [
              'Interviewers assigned distinct roles',
              'Facebook: behavioural, coding, design',
              'Rounds are deliberately non-overlapping. Prepare all three; do not assume the whole loop is algorithms.',
            ],
            [
              'Hiring by the company, not the team',
              'Facebook bootcamp; Google',
              'You may not know your team when you accept. Ask how placement works and how easy internal moves are.',
            ],
            [
              'Interviewing for one specific team',
              'Palantir, Microsoft',
              "Read that team's product. Specific, informed opinions about it are a real differentiator.",
            ],
            [
              'Meeting a manager or director late in the day',
              'Microsoft "as app"; Apple',
              'Usually a good sign - you only get there if the earlier rounds went well.',
            ],
            [
              'A timed online coding assessment',
              'Palantir; increasingly common',
              'You can look things up, so the bar is higher. Practise under the same time pressure.',
            ],
            [
              'Passion for the product tested explicitly',
              'Apple, Microsoft',
              'Have a real answer to "why us" grounded in something you have actually used or read.',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Prepare for the emphasis, not the trivia',
          text: 'A company that runs consumer services at scale will ask about scale. One that sells to enterprises may ask more about design and reliability. Match your examples to the company - but never rely on company-specific trivia, which is not what anyone is testing.',
        },
      ],
    },
    {
      id: 'what-to-do',
      title: 'What to do with this',
      takeaway:
        'Ask the recruiter everything, treat every interaction as part of the loop, and read nothing into tone.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Public information is context. Your recruiter is the source of truth, and they are usually happy to tell you exactly what is coming - it is in their interest for you to do well.',
        },
        {
          kind: 'bullets',
          items: [
            'How many rounds, how long, and what each one covers.',
            'The coding environment: whiteboard, shared document, or a laptop with an editor.',
            'Which languages are acceptable.',
            'Whether system design is included, and at what depth.',
            'What level you are being interviewed for.',
            'The timeline for a decision, and who to contact if it slips.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Everything counts, including lunch',
          text: 'The lunch round often carries no formal feedback, but "often" is not "never", and anything memorable travels. Treat every conversation in the building as part of the loop - while still using it to ask the honest questions you cannot ask a scored interviewer.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Interviewer affect is not signal',
          text: 'A warm interviewer may have written you up badly; a flat one may be your strongest advocate. Some deliberately hold a neutral face, some say "good luck" to everyone, and some are simply having a bad day. Reading tone mid-loop only costs you focus in the next round.',
        },
        {
          kind: 'p',
          text: 'Finally: teams are asking what it would be like to solve a problem with you. Receptiveness, collaboration, and how you handle being wrong are being assessed continuously, in every round, whether or not the round has a name for it.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'bts-1',
      kind: 'concept',
      prompt: 'A "screening" phone interview conducted by an engineer typically:',
      options: [
        'Only covers your background and interests',
        'Asks real coding and algorithm questions, sometimes at the same bar as the onsite',
        'Is a formality once a recruiter has approved you',
        'Is always easier than the onsite',
      ],
      answerIndex: 1,
      explain:
        'If you are unsure, ask what role your interviewer holds. An engineer means a technical round - prepare for it as such.',
    },
    {
      id: 'bts-2',
      kind: 'concept',
      prompt:
        'You had a weak second interview in a five-round onsite. The likely effect on round three is:',
      options: [
        'Your interviewer will have seen the negative feedback and be primed against you',
        'None - feedback is usually written before it is shared, so each round starts from a blank slate',
        'The loop will be cut short',
        'You will be asked an easier question to compensate',
      ],
      answerIndex: 1,
      explain:
        'Independent write-up is deliberate: it stops one opinion anchoring the others. Every round is genuinely a fresh start.',
    },
    {
      id: 'bts-3',
      kind: 'concept',
      prompt:
        'One round felt far harder and much less related to the team than the others. The most likely explanation is:',
      options: [
        'The interviewer had already decided to reject you',
        'A deliberately different interviewer - brought in from outside the team to hold the bar - which is graded against its own population',
        'A scheduling mistake',
        'You were being considered for a more senior role',
      ],
      answerIndex: 1,
      explain:
        'The bar-raiser pattern exists to stop a team lowering its own standards. Struggling more in it does not mean doing worse in it.',
    },
    {
      id: 'bts-4',
      kind: 'concept',
      prompt:
        'Your interviewer was noticeably cold and gave no encouragement. What should you conclude?',
      options: [
        'It went badly',
        'Nothing - affect is not signal, and some interviewers deliberately stay neutral',
        'They were not interested in your background',
        'You should ask the recruiter for a re-interview',
      ],
      answerIndex: 1,
      explain:
        'Warmth and write-ups correlate poorly. Reading tone mid-loop costs you concentration in the next round and buys you nothing.',
    },
    {
      id: 'bts-5',
      kind: 'technique',
      prompt: 'Which is the most useful thing to ask your recruiter before the onsite?',
      options: [
        'What questions the interviewers usually ask',
        'The number and type of rounds, the coding environment, acceptable languages, and the level being interviewed for',
        'Who else is being considered',
        'How previous candidates performed',
      ],
      answerIndex: 1,
      explain:
        'These change how you prepare. Question lists barely exist and are not what is being tested.',
    },
    {
      id: 'bts-6',
      kind: 'concept',
      prompt: 'The lunch interview is best treated as:',
      options: [
        'Time off from the loop',
        'A low-pressure chance to ask honest questions, while remembering that anything memorable can still travel',
        'The most important round of the day',
        'A trick designed to catch you out',
      ],
      answerIndex: 1,
      explain:
        'It usually carries no formal feedback, which makes it genuinely the best round to ask real questions in - but "usually" is not "never".',
    },
    {
      id: 'bts-7',
      kind: 'concept',
      prompt:
        'A packet with one outstanding round and two weak ones usually loses to one with four solid rounds because:',
      options: [
        'Interviewers average the scores',
        'The decision asks whether the evidence supports a hire, and repeated weak signals are evidence',
        'The best round is discarded as an outlier',
        'Only the final round counts',
      ],
      answerIndex: 1,
      explain:
        'Consistency is what survives translation into write-ups. One peak rarely offsets a pattern.',
    },
    {
      id: 'bts-8',
      kind: 'concept',
      prompt: 'Ten days after your onsite you have heard nothing. The right move is:',
      options: [
        'Assume rejection and move on',
        'Send a polite check-in to your recruiter',
        'Contact the interviewers directly',
        'Reapply through the website',
      ],
      answerIndex: 1,
      explain:
        'Delays are routine - a missing write-up, an approval stage, a busy recruiter. Silence is not a decision.',
    },
  ],
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
