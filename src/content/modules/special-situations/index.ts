import type { CourseModule } from '../../types';

export const specialSituations: CourseModule = {
  id: 'special-situations',
  title: 'Special Situations',
  track: 'process',
  status: 'complete',
  source: 'Part III',
  summary:
    'How preparation changes for experienced engineers, testers, PMs, leads, startup roles and acquisitions.',
  estimatedMinutes: 20,
  concepts: [
    'Experienced candidates: fundamentals still get tested, plus deeper architecture and ownership stories',
    'Years of experience raise the bar on design and on how you talk about tradeoffs, not just on coding',
    'Keeping coding sharp when your day job is managerial or highly abstracted',
    'Testers and SDETs: strong coding *and* a rigorous risk-based testing mindset - both are assessed',
    'Product and program roles: customer goals, prioritisation, metrics, and technical feasibility',
    'Leads and managers: prepare examples of hiring, coaching, conflict, execution and hard decisions',
    'Startup interviews: autonomy, breadth, speed of learning, comfort with missing structure',
    'Acquisition and acquihire interviews: the company evaluation and each individual employment decision are separate',
    'Tailoring depth to the target role rather than presenting one generic identity',
    'For interviewers: standardise criteria, record evidence rather than impressions, and give calibrated hints',
  ],
  sections: [
    {
      id: 'experienced',
      title: 'Experienced candidates',
      takeaway:
        'Slightly fewer algorithm questions, much higher expectations on architecture and on your own history.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The common hope is that algorithm questions are for new graduates. They are not. If a company asks them of inexperienced candidates, it asks them of experienced ones too - rightly or wrongly, those skills are believed to matter for every developer.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The standard does not drop',
          text: 'Some interviewers go easier on experienced candidates, reasoning that it has been years since an algorithms class. Others go harder, reasoning that more years means more problems seen. On average it cancels out - so plan for the same bar, not a softer one.',
        },
        {
          kind: 'p',
          text: 'What genuinely changes is where the *extra* weight lands.',
        },
        {
          kind: 'bullets',
          items: [
            '**System design and architecture.** Students rarely encounter these outside a job, so your answers are judged against your experience level. That cuts both ways: six years in means a vague answer is a bad answer.',
            '**Your resume.** Every line is fair game, and "the hardest bug you have faced" should have a substantially better answer from you than from a graduate.',
            '**Tradeoffs.** Naming a technology is not the answer; explaining what you gave up to choose it is.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Never let the coding atrophy',
          text: 'This bites hardest when your day job has drifted into management, coordination, or gluing services together. The interview will still ask you to write a correct function on a whiteboard, and being out of practice is indistinguishable from being unable.',
        },
        {
          kind: 'p',
          text: 'Practically: pick one system you designed or substantially changed and prepare to go three levels deep on it. Expect "why that database", "what breaks at ten times the load", and "what would you do differently". Those three questions expose more about a senior engineer than any algorithm question does.',
        },
      ],
    },
    {
      id: 'by-role',
      title: 'Preparing to the role',
      takeaway: 'The mix is different for every role. Spend your time where the weight is.',
      audio: true,
      blocks: [
        { kind: 'anim', animId: 'ss-weights' },
        {
          kind: 'p',
          text: '**Testers and SDETs** write code to test features rather than to build them, which means double the preparation: everything a developer prepares, plus a rigorous testing mindset. The most common reason SDET candidates are rejected is coding, not testing. Expect the format "write code to do X" followed immediately by "now test it" - and get in the habit of asking yourself the second question even when nobody does. Communication matters unusually much here too, because the job touches everyone.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The SDET career-path warning',
          text: 'Many candidates treat an SDET role as the easy way into a company. Moving from test into development afterwards is genuinely hard. If that is the plan, keep your coding and algorithms sharp and make the move within a year or two, or you may not be taken seriously in a development interview later.',
        },
        {
          kind: 'p',
          text: '**Product and program roles** vary enormously - some PMs are effectively customer-facing, others write code daily, and the ones who code get tested on it. Across companies, the areas assessed are fairly stable:',
        },
        {
          kind: 'table',
          headers: ['Area', 'What it looks like in the room'],
          rows: [
            [
              'Handling ambiguity',
              'You are given a vague problem and expected to seek information, prioritise, and structure it rather than stall',
            ],
            [
              'Customer focus (attitude)',
              '"Design an alarm clock for the blind" - do you ask who the user is and how they use it, or design for yourself?',
            ],
            [
              'Customer focus (technical)',
              'Enough depth in the product area to make feasible decisions; how much depends entirely on the team',
            ],
            [
              'Multi-level communication',
              '"Explain TCP/IP to your grandmother", and how you describe your own past projects',
            ],
            ['Passion for technology', 'A real, specific answer to "why this company / this team"'],
            [
              'Teamwork and leadership',
              '"Tell me about a teammate who was not pulling their weight" - probably the most heavily weighted area',
            ],
          ],
        },
        {
          kind: 'p',
          text: '**Leads and managers** are usually expected to code well - some companies hold managers to a developer bar deliberately. On top of that: prioritisation (what would you cut to make the date, and how would you find out what is critical), communication up and down and sideways, and above all a track record of getting things done. That last one is a balance question: enough planning, not so much that nothing ships.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Leadership is assessed implicitly too',
          text: 'You are asked directly about a disagreement with a manager - and simultaneously observed on how you interact with the interviewer. Coming across as arrogant, or as too passive to push back, both read badly for a management role.',
        },
        {
          kind: 'p',
          text: '**Startups** are highly variable, and the strongest way in is usually a personal referral - which need not be a close friend; reaching out and expressing genuine interest often gets your resume picked up. They look for initiative on your resume (what have you *started*?) and for the ability to hit the ground running, which means they will probe your specific languages and stack rather than general aptitude. Personality fit is assessed through the conversation itself. Standard coding and algorithm questions are common as well. One practical note: many smaller companies cannot sponsor work visas, and no amount of persuasion changes that - target larger startups or work through a recruiter who knows which ones can.',
        },
      ],
    },
    {
      id: 'acquisitions',
      title: 'Acquisition and acquihire interviews',
      takeaway:
        'The team is evaluated as individuals. Prepare as a team, early, and expect surprises.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: "During technical due diligence, many acquirers interview most or all of a startup's engineers - partly because their own employees had to pass the same process, and partly because the team is often the point of the acquisition. Very large product or user-base acquisitions usually skip it; talent-driven ones usually do not, and there is a wide grey area in between.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'These are not a formality',
          text: 'They can decide whether the acquisition happens at all, which employees receive offers, and the price. Treat them as the highest-stakes interviews of the year, because that is what they are.',
        },
        {
          kind: 'bullets',
          items: [
            '**Everyone goes through it.** Engineers certainly; often sales, support and product too. A CEO is usually slotted into a product-manager or engineering-manager loop, whichever is closer to what they actually do.',
            '**Being mis-slotted is a real risk.** A data scientist interviewed as a software engineer, or a junior engineer sold as senior, underperforms for reasons that have nothing to do with their ability. Sometimes a re-interview at the right level is possible - so raise the levelling *before* the loop, not after.',
            '**The standard is essentially the same, with slightly more leeway.** Big companies lean towards no-hire when uncertain; in an acquisition, a strong team can pull a borderline person through.',
            '**Underperformers may get a contract role for knowledge transfer** rather than an offer - typically six months, sometimes converted.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Your strongest and weakest performers will surprise you',
          text: 'Problem-solving interviews measure something a manager rarely measures directly. The junior engineer who still has a lot to learn professionally may be the best interviewer on the team. Do not decide in advance who needs preparation.',
        },
        {
          kind: 'p',
          text: 'How to prepare a team: start before there is a date. These loops appear suddenly - conversations get serious and then it is "can you come in at the end of the week", which is not enough time to learn big O from scratch. Teams that pause real work for two or three weeks of preparation do substantially better. Study individually, in pairs, and by running mock interviews on each other, and give the people without a computer science background - or with a very old one - the extra time they genuinely need. A good first exercise for them is implementing the core data structures from scratch.',
        },
      ],
    },
    {
      id: 'for-interviewers',
      title: 'If you are the interviewer',
      takeaway:
        'Know which mode you are in, ask questions with several hurdles, and coach rather than watch people flounder.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Worth reading even if you are only interviewing on the other side of the table - it tells you what a well-run interview is supposed to look like, and it will be your job soon enough.',
        },
        {
          kind: 'table',
          headers: ['Mode', 'Purpose', 'How it goes wrong'],
          rows: [
            [
              'Sanity check',
              'Confirm a floor of competence',
              'Treating a small difference in performance as a real signal',
            ],
            [
              'Quality check',
              'Distinguish good from excellent problem-solvers',
              'Asking a question that is hard for the wrong reasons',
            ],
            [
              'Specialist',
              'Test knowledge a good engineer could not pick up on the job',
              'Asking it of people who are not specialists, or hiring specialists you do not need',
            ],
            [
              'Proxy knowledge',
              'Check they absorbed things core to work they claim to have done',
              'Confusing it with specialist knowledge and rejecting on trivia',
            ],
          ],
          caption:
            'Most hiring problems are a mismatch between these four - usually asking one and grading as another.',
        },
        {
          kind: 'bullets',
          items: [
            '**Do not ask questions straight out of a popular book.** Your candidates have read it. You would be testing memory, not problem-solving.',
            '**Ask medium and hard questions with several hurdles.** A question resting on one insight splits candidates into "got it" and "did not", which is a single data point. If one hint transforms someone\'s performance, it is a weak question.',
            '**Hard question, not hard knowledge.** Expect big O and trees; do not expect Dijkstra or AVL internals. Every extra skill you screen on shrinks your offer rate without necessarily improving your hires.',
            '**Defuse scary-sounding questions.** Anything smelling of maths, probability, memory internals or proprietary systems intimidates people out of performing. Say up front that it is not a maths question, and mean it.',
            '**Offer positive reinforcement.** Nervous candidates underperform, and a candidate who disliked you is less likely to accept - and will tell their friends. There is always something they got right.',
            '**Probe deeper on behavioural answers.** People trained to credit their team can sound like they did nothing. Ask directly what *their* role was before concluding it was nothing. Being a good interviewee is its own skill, and probably not the one you meant to measure.',
            '**Coach.** If they have not written an example, or wrote a special case, or dived into code too early, guide them. You can still mark it down while removing the effect of not having prepared.',
            '**If they want silence, give them silence.** Learn the difference between "I am stuck" and "I am thinking", and take into account that a quiet candidate got less guidance than a talkative one.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Record evidence, not impressions',
          text: 'Write what the candidate did and said - which hurdles they cleared unaided, where the hint came, what the code looked like. "Seemed sharp" survives no scrutiny at a hiring meeting and is where bias enters.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'ss-1',
      kind: 'concept',
      prompt: 'How much less do experienced candidates get asked algorithm questions?',
      options: [
        'Not at all - they are replaced by design questions',
        'Only slightly. What is added is architecture depth and much higher expectations on your resume',
        'About half as much',
        'It depends entirely on the company',
      ],
      answerIndex: 1,
      explain:
        'Some interviewers grade experience more leniently, some more harshly. On average it cancels out - plan for the same coding bar.',
    },
    {
      id: 'ss-2',
      kind: 'concept',
      prompt: 'The single most common reason SDET candidates are rejected is:',
      options: ['Weak testing instincts', 'Coding', 'Communication', 'Lack of domain knowledge'],
      answerIndex: 1,
      explain:
        'SDETs are held to a high coding bar as well as a testing one. It is double the preparation, not half.',
    },
    {
      id: 'ss-3',
      kind: 'technique',
      prompt:
        'Asked "design an alarm clock for the blind" in a PM interview, the assessed behaviour is:',
      options: [
        'Producing a creative design quickly',
        'Asking who the user is and how they actually use it, rather than designing for yourself',
        'Estimating the manufacturing cost',
        'Naming the technologies you would use',
      ],
      answerIndex: 1,
      explain:
        'This is a customer-focus question wearing a design costume. The clarification is the answer.',
    },
    {
      id: 'ss-4',
      kind: 'concept',
      prompt:
        'In an acquisition interview, an employee performs poorly. The most likely benign explanation is:',
      options: [
        'They are a weak engineer',
        'They were mis-slotted - a data scientist put through a software engineering loop, or a junior sold as senior',
        'The acquirer wants to lower the price',
        'They did not want the acquisition to succeed',
      ],
      answerIndex: 1,
      explain:
        'Mis-slotting is common and sometimes fixable with a re-interview at the right level. Raise levelling before the loop.',
    },
    {
      id: 'ss-5',
      kind: 'technique',
      prompt:
        'Your startup expects acquisition interviews at some unknown point. When should the team start preparing?',
      options: [
        'When a date is confirmed',
        'Immediately - loops appear suddenly, and "come in at the end of the week" is not enough time to learn fundamentals',
        'After the term sheet is signed',
        'Only the engineers without CS degrees need to prepare',
      ],
      answerIndex: 1,
      explain:
        'Teams that pause real work for two or three weeks of preparation do substantially better. Waiting for a date leaves days.',
    },
    {
      id: 'ss-6',
      kind: 'concept',
      prompt:
        "As an interviewer, a question where a single hint transforms a candidate's performance is:",
      options: [
        'Ideal - it isolates one crisp insight',
        'A weak question - it yields one data point instead of several hurdles',
        'Only suitable for senior candidates',
        'A good sanity check',
      ],
      answerIndex: 1,
      explain:
        'You want a series of hurdles and optimisations. Multiple data points beat one, and one insight splits candidates on luck as much as skill.',
    },
    {
      id: 'ss-7',
      kind: 'concept',
      prompt:
        'A candidate answers a behavioural question entirely in terms of "we" and "the team". You should:',
      options: [
        'Conclude they contributed little',
        'Ask directly what their own role and actions were before concluding anything',
        'Move on to the next question',
        'Mark them down for poor communication',
      ],
      answerIndex: 1,
      explain:
        'Many people are trained to credit their team. Not describing your actions makes you a flawed candidate, not a flawed employee.',
    },
    {
      id: 'ss-8',
      kind: 'technique',
      prompt:
        'An interviewer wants a harder question, so they ask about red-black tree internals. The problem is:',
      options: [
        'Nothing - it filters effectively',
        'They made the knowledge hard rather than the problem hard, so it screens on memorisation instead of problem-solving',
        'The question takes too long',
        'Red-black trees are too common',
      ],
      answerIndex: 1,
      explain:
        'Expect big O and trees; do not expect Dijkstra or AVL internals. Every extra screened skill shrinks the offer rate without improving hires.',
    },
  ],
  drills: [],
  practice: [
    {
      id: 'ss-position',
      title: 'Write your one-paragraph positioning',
      detail:
        'Six years out of a CE degree, recent depth in JS/TS product engineering. Say what you own end to end, and what scale you have worked at. This is the frame every other answer hangs off.',
    },
    {
      id: 'ss-depth',
      title: 'Prepare one architecture story you can go three levels deep on',
      detail:
        'Pick a system you designed or substantially changed. Be ready for "why that database", "what would break at 10x", and "what would you do differently".',
    },
    {
      id: 'ss-role-map',
      title: 'Map your prep time to each target role',
      detail:
        'For every company on your list, write down which kinds of round the loop actually contains and reweight your week accordingly. Preparing generically wastes the half of your time that should have gone somewhere specific.',
    },
  ],
};
