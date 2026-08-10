import type { CourseModule } from '../../types';

export const interviewProcess: CourseModule = {
  id: 'interview-process',
  title: 'The Interview Process',
  track: 'process',
  status: 'complete',
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
  sections: [
    {
      id: 'what-is-measured',
      title: 'What is actually measured',
      takeaway: 'Five axes, weighted by round, graded against everyone who ever got the same question.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'At most large tech companies, algorithm and coding problems are the biggest part of the loop. They are problem-solving questions: the interviewer wants to watch you handle something you have not seen before. You will usually get through exactly one of them in forty-five minutes.',
        },
        { kind: 'anim', animId: 'ip-axes' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'There is no scoresheet',
          text: 'Nobody is awarding points for a hash map. Your interviewer walks away with a judgement and writes it up, sometimes as a number - but the number summarises the judgement, it does not compute it.',
        },
        {
          kind: 'p',
          text: 'And the judgement is relative. Your interviewer compares you against everyone they have ever asked this question - not against the other candidates that week, and not against an absolute standard. Which has a useful consequence: **drawing a hard question is not bad luck**, because it was hard for everyone else too.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Why the process looks like this',
          text: 'Companies accept that they reject good people; what they are really guarding against is hiring someone who is not good. That asymmetry explains the whole design - a false negative costs them one candidate, a false positive costs them years.',
        },
        {
          kind: 'p',
          text: 'The standard objections are fair, and worth understanding rather than resenting. You rarely build a binary search tree at work - but it is very hard to know you *should* use one if you have never heard of it, and problem-solving questions are difficult to ask without touching these structures. Whiteboards are artificial - but nobody expects compiling code on one, and taking away the compiler and the boilerplate is what leaves room for the interesting part. What the format does not measure is work ethic, focus, or deep familiarity with a specific technology. Some companies should weight those far more heavily and do not.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '"What are the recent questions at company X?"',
          text: 'The question is built on a false premise. At most companies interviewers pick their own questions, so nothing makes one a "recent Google question" beyond a Google engineer having happened to ask it. A Google algorithm question and a Facebook algorithm question are the same question. Prepare techniques, not lists.',
        },
      ],
    },
    {
      id: 'in-the-room',
      title: 'In the room',
      takeaway: 'Think out loud, use every constraint, take the hint, and budget the clock.',
      audio: true,
      blocks: [
        { kind: 'anim', animId: 'ip-timeline' },
        {
          kind: 'p',
          text: 'The behaviours that separate candidates are almost all visible ones - which means they only count if you say them out loud.',
        },
        {
          kind: 'table',
          headers: ['Do', 'Instead of'],
          rows: [
            ['Restate the problem and ask what is ambiguous', 'Assuming, and building the wrong thing'],
            ['State your assumptions about input, size, and available APIs', 'Leaving them implicit and being surprised later'],
            ['Say the brute force and its complexity, then improve it', 'Silence while you hunt for the clever answer'],
            ['Name the alternatives and why you rejected them', 'Presenting one approach as if it were the only one'],
            ['Take the hint and build on it', 'Resisting help to look independent'],
            ['Volunteer testing and complexity', 'Waiting to be asked'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Ambiguity is part of the question',
          text: 'Questions are vague on purpose. Asking what happens on an empty input, whether duplicates are possible, or whether the array fits in memory is not a delay before the answer - it is a scored part of it.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'A mistake is not the end',
          text: 'Almost nobody has a flawless interview, and plenty of people are hired after a rocky one. When you find a bug, say what caused it and why your fix is right. Panicked patching does far more damage than the original mistake.',
        },
        {
          kind: 'p',
          text: 'On language: use the one you write correct code fastest in, unless the role requires otherwise. Prefer something widely readable, remember that very terse languages hide mistakes rather than preventing them, and know that you are usually allowed to assume a helper exists rather than writing it out.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'And if you have seen the question before',
          text: 'Say so immediately. It is the honest move, and it is also the practical one - being caught pretending is far worse than losing one question.',
        },
      ],
    },
    {
      id: 'practise-properly',
      title: 'Practising for it',
      takeaway: 'Practise the conditions, not just the problems. Aloud, timed, without the tools.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Almost everyone practises problems in an IDE, in silence, with no clock. Then the interview asks for something else entirely, and the gap is the reason strong engineers underperform.',
        },
        {
          kind: 'steps',
          items: [
            '**Out loud, always.** Narrate every drill you solve this month. Silence in an interview reads as being stuck even when you are not, and it is the most common avoidable failure.',
            '**On the real medium.** Paper, a whiteboard, or a plain shared document - no autocomplete, no red squiggles, no test runner.',
            '**Against a clock.** Forty-five minutes end to end, including the parts you find boring.',
            '**With someone else choosing the question.** Choosing your own quietly removes the hardest part of the exercise.',
            '**Ask for feedback on communication, not just correctness.** That is the axis you cannot self-assess.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Keep a mistake list',
          text: 'Every time you get something wrong, write down the mistake - not the problem. Off-by-one in a while loop; forgot the empty case; jumped to code before the algorithm was settled. The list is short and repetitive, and reviewing it before an interview is worth more than another twenty problems.',
        },
        {
          kind: 'p',
          text: 'Two practical notes on the process itself. Not hearing back immediately means nothing - the usual explanation is that one interviewer has not filed their feedback. If it has been three to five business days after an onsite, check in politely with your recruiter. And a rejection is rarely permanent: most companies will re-interview after six to twelve months, and a first bad interview usually has little effect the second time. Plenty of people are rejected by a company and hired by it later.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'ip-1',
      kind: 'concept',
      prompt: 'You are given a noticeably harder question than a friend who interviewed the same week. This is:',
      options: [
        'Bad luck that will lower your score',
        'Neutral - you are compared against other candidates on the same question, and it was hard for them too',
        'A sign the interviewer has already decided against you',
        'Grounds to ask for a different question',
      ],
      answerIndex: 1,
      explain:
        'Evaluation is relative to everyone the interviewer has asked that question. Difficulty normalises out.',
    },
    {
      id: 'ip-2',
      kind: 'concept',
      prompt: 'Why do companies accept that their process rejects some good engineers?',
      options: [
        'They do not have time to interview properly',
        'A false negative costs one candidate; a false positive costs years - so the process is deliberately tuned against the second',
        'Because there is no way to measure engineering ability',
        'To keep offer numbers low',
      ],
      answerIndex: 1,
      explain:
        'That asymmetry explains most of the format, including why "on the fence" usually resolves to no-hire.',
    },
    {
      id: 'ip-3',
      kind: 'technique',
      prompt: 'Your interviewer offers a hint ten minutes in. The best response is:',
      options: [
        'Decline it and keep working, to demonstrate independence',
        'Take it, say how it changes your thinking, and build on it',
        'Take it silently and continue',
        'Ask for the full solution instead',
      ],
      answerIndex: 1,
      explain:
        'Hints are normal and expected. Using one well is a positive signal; refusing help reads as poor collaboration.',
    },
    {
      id: 'ip-4',
      kind: 'technique',
      prompt: 'In a 45-minute algorithm interview, roughly how much time should pass before you write code?',
      options: ['Two or three minutes', 'About half the interview', 'As soon as you have any idea', 'Thirty-five minutes'],
      answerIndex: 1,
      explain:
        'Clarify, example, brute force and optimise all come first. Fixing a design out loud is far cheaper than fixing half-written code.',
    },
    {
      id: 'ip-5',
      kind: 'concept',
      prompt: 'Asking "what are the recent interview questions at company X?" misunderstands the process because:',
      options: [
        'Companies never repeat questions',
        'Interviewers mostly choose their own questions, so there is no company-wide list and the questions barely differ between similar companies',
        'The questions change every quarter',
        'Recruiters are not allowed to say',
      ],
      answerIndex: 1,
      explain:
        'Prepare techniques rather than lists. An algorithm question at one large company looks like an algorithm question at any other.',
    },
    {
      id: 'ip-6',
      kind: 'technique',
      prompt: 'Which practice habit closes the biggest gap between drilling and interviewing?',
      options: [
        'Solving more problems per week',
        'Solving them out loud, on paper or a plain editor, against a clock',
        'Memorising solutions to common questions',
        'Reading other people’s solutions after each problem',
      ],
      answerIndex: 1,
      explain:
        'Silence and IDE dependence are what actually break in the room. Practise the conditions, not just the problems.',
    },
    {
      id: 'ip-7',
      kind: 'concept',
      prompt: 'You have not heard back three days after your onsite. This means:',
      options: [
        'You have been rejected',
        'Nothing - delays are routine, and a polite check-in with the recruiter after 3-5 business days is the right move',
        'The team is negotiating your offer',
        'You should reapply immediately',
      ],
      answerIndex: 1,
      explain:
        'The usual cause is one interviewer who has not written up their feedback yet. Silence carries no information.',
    },
    {
      id: 'ip-8',
      kind: 'concept',
      prompt: 'You recognise the question because you solved it last week. You should:',
      options: [
        'Say nothing and solve it smoothly',
        'Tell the interviewer straight away',
        'Pretend to struggle so it looks natural',
        'Solve it deliberately badly',
      ],
      answerIndex: 1,
      explain:
        'Otherwise the interviewer learns nothing about you, and being caught costs far more than one question ever could.',
    },
  ],
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
    {
      id: 'ip-mistakes',
      title: 'Keep a running list of your own mistakes',
      detail:
        'After every problem, write down the mistake rather than the problem: off-by-one, forgot the empty case, coded before the algorithm was settled. Re-read the list before each mock.',
    },
  ],
};
