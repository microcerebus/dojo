import type { CourseModule } from '../../types';

export const offerAndBeyond: CourseModule = {
  id: 'offer-and-beyond',
  title: 'The Offer & Beyond',
  track: 'process',
  status: 'complete',
  source: 'Part VIII',
  summary: 'Rejection, comparing offers, negotiating on evidence, and the first months after you join.',
  estimatedMinutes: 20,
  concepts: [
    'Rejection is noisy evidence, not a verdict - ask when you can reapply and keep the relationship open',
    'Offers come with deadlines, usually one to four weeks; asking for an extension is normal',
    'Decline on terms that cannot be argued with, and keep the door open',
    'Get the offer and all material terms in writing',
    'Evaluate the whole package: role, manager, team, learning, trajectory, location, risk, hours',
    'Compare equity on ownership percentage, dilution, vesting, exercise terms and realistic outcomes - never share count alone',
    'Maintaining alternatives is what creates negotiating room',
    'Negotiate collaboratively, grounded in market data or a competing offer',
    'Negotiate the whole package: level, base, bonus, equity, start date, flexibility',
    'Never bluff about offers or invent deadlines',
    'Get every negotiated change documented before you accept',
    'After joining: keep learning, ask for feedback early, build relationships, choose visible work',
  ],
  sections: [
    {
      id: 'offers-and-rejection',
      title: 'Offers, deadlines and rejection',
      takeaway: 'Deadlines are movable, declines should be unarguable, and a rejection is an appointment to come back.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The interviews are over and a different set of decisions starts. Handle these badly and you lose money, options, or a relationship you will want in three years.',
        },
        {
          kind: 'bullets',
          items: [
            '**Deadlines.** Almost every offer has one, usually one to four weeks out. If you are waiting on other companies, ask for an extension - it is a normal request and it is usually granted.',
            '**Get it in writing.** The offer and every material term: base, bonus structure, equity and its vesting, level, start date, and anything you negotiated. A verbal promise from a recruiter who leaves the company is worth nothing.',
            '**Declining.** Give a reason that is non-offensive and impossible to argue with. "I have decided a startup is the right environment for me right now" cannot be countered by a large company, because they cannot become one. Do not hand them something they can fix, unless you want them to.',
            '**Keep the door open.** You may want this company in a few years, or the people you met may move somewhere you want to be. A gracious decline costs nothing and is remembered.',
          ],
        },
        { kind: 'anim', animId: 'ob-leverage' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Rejection is noisy evidence',
          text: 'Plenty of excellent engineers interview badly, or simply have an off day, and companies know it. Many actively want to re-interview people they turned down, and some expedite them.',
        },
        {
          kind: 'p',
          text: 'So when the call comes: thank the recruiter, say you are disappointed but understand, and ask two things. When can you reapply - usually six to twelve months - and is there anything they would suggest working on. Most large companies will not give feedback, but a few will, and asking costs nothing.',
        },
      ],
    },
    {
      id: 'evaluating',
      title: 'Evaluating an offer',
      takeaway: 'Salary is one term of many, and rarely the biggest. Compare the whole thing, on paper, before the deadline.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The biggest mistake candidates make is anchoring on base salary. It is the easiest number to compare, which is exactly why it misleads - people routinely accept the offer that was financially worse.',
        },
        { kind: 'anim', animId: 'ob-equity' },
        {
          kind: 'table',
          headers: ['Component', 'How to compare it'],
          rows: [
            ['Base salary', 'Straightforward - and the least differentiating part'],
            ['Signing bonus, relocation', 'Amortise over the years you expect to stay, then add to the annual figure'],
            ['Annual bonus', 'Ask the target percentage and what it actually paid out last year. Ranges from about 3% to 30%'],
            ['Equity (public)', 'Amortise the annual grant value; it is close to cash, subject to price movement'],
            ['Equity (private)', 'Ownership percentage, not share count. Then dilution, vesting, cliff, strike price, and the exercise window if you leave'],
            ['Cost of living and tax', 'A 30% difference between cities is normal and swamps most salary differences'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Share count tells you nothing',
          text: '"Ten thousand shares" is meaningless without the total outstanding. Ask what percentage of the company it represents, what the last round valued it at, how much dilution to expect, and how long you have to exercise after leaving - a 90-day window on options you cannot afford means the grant may be worth zero.',
        },
        {
          kind: 'p',
          text: 'Then the parts that are not money at all, which usually matter more over a career:',
        },
        {
          kind: 'bullets',
          items: [
            '**What you will learn, and from whom.** This moves your lifetime earnings more than the starting number does.',
            '**Manager and teammates.** When people say they love or hate a job, this is almost always what they mean. Did you enjoy talking to them?',
            '**Trajectory.** How does promotion actually work here? Is the team growing? If you want to move into management later, is there a real path?',
            '**Where it leaves you.** If you leave in three years, are there other companies you would want nearby, or would you have to move? Few local options means fewer future opportunities - the most commonly overlooked factor on this list.',
            '**Stability versus growth.** These trade off. Fast-growing companies are less stable; how much that matters depends on visa constraints and how quickly you could find something else.',
            '**Hours and culture.** Ask future teammates directly what a normal week looks like - and remember that the weeks before a deadline are not normal weeks.',
            '**How easy it is to switch teams internally.** Where that is easy, a mediocre initial team placement matters much less.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Build the comparison sheet before you need it',
          text: 'Fill in the columns the day an offer arrives, not the day before the deadline. Deciding under time pressure is how people end up optimising the one number that was easiest to read.',
        },
      ],
    },
    {
      id: 'negotiating',
      title: 'Negotiating',
      takeaway: 'Do it. Be specific, overshoot slightly, ask about the whole package, and never bluff.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A negotiations class was once asked how much cheaper a car would have to be at the dealership that haggles. The average answer was 750 dollars - people would pay 750 dollars to avoid an hour of discomfort. Most of the same students had never negotiated a job offer, which is the same trade at fifty times the price.',
        },
        {
          kind: 'steps',
          items: [
            '**Just do it.** Recruiters do not withdraw offers because you negotiated - especially at larger companies, where you are not negotiating with your future teammates. The downside is an awkward conversation; the upside compounds for years.',
            '**Have a viable alternative.** This is the mechanism that makes negotiation work: a recruiter improves an offer because they are worried you will not join. Another live offer makes that worry concrete.',
            '**Make a specific ask.** "Could you do another 10k on base?" beats "is there any flexibility?" - a vague ask can be satisfied with a token amount and technically honoured.',
            '**Overshoot a little.** This is a back-and-forth. Ask slightly above your target and expect to meet in the middle.',
            '**Think beyond salary.** Companies are often more willing to move on signing bonus, equity or relocation-as-cash, because raising base too far puts you out of line with your peers.',
            '**Use the medium you are best in.** Phone is generally better. Email is much better than not asking.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Large companies negotiate within a level',
          text: 'Most big employers band their pay by level, and there is real room inside a band but very little above it. A big jump means convincing the recruiter and the team that your experience matches the next level up. That is a harder conversation and worth far more than a few thousand on base.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Never bluff',
          text: 'Do not invent a competing offer, a number, or a deadline. Recruiters talk to each other, verify things, and remember. Getting caught costs you the offer and the relationship - and a real, smaller offer used honestly works better than an imagined large one.',
        },
        {
          kind: 'p',
          text: 'Ground the request in evidence rather than need: the market band for this level in this city, a competing offer, a specific scope of responsibility. And keep it collaborative - you are about to work with these people, and "here is what would make this an easy yes" lands very differently from an ultimatum. Then, when you agree something, get it into the written offer *before* you accept. After acceptance there is nothing left to trade with.',
        },
      ],
    },
    {
      id: 'on-the-job',
      title: 'After you join',
      takeaway: 'Set a timeline, ask for what you want, build the network before you need it, and keep interviewing.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The common story: you join, everything is good, and five years later you notice that the last three added nothing to your skills or your resume. Enjoying a job makes it easy to stop noticing that your career has stopped moving.',
        },
        {
          kind: 'bullets',
          items: [
            '**Set a timeline before you start.** Where do you want to be in ten years, and what does this job have to give you to get you there? Check in once a year: what did the last twelve months actually add?',
            '**Ask for what you want.** Some managers actively grow your career; many take a hands-off approach and are simply waiting to be told. If you want more back-end work, or more leadership scope, say so plainly. You have to be your own advocate.',
            '**Build relationships before you need them.** Your network is what makes the next move possible, since a referral beats an application. Stay in touch with people who leave - a short note a few weeks after they go is what converts a colleague into a contact.',
            '**Choose work with visible impact.** Not politics: simply preferring projects whose outcome can be described to someone outside the team, because those are what promotions and future interviews are built from.',
            '**Keep interviewing.** Once a year, even when you are happy. It keeps the skill alive, tells you what the market pays, and builds a connection with a company you might want later. You do not have to take the offer.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Ask for feedback early',
          text: 'In the first few months, ask your manager directly what would make you excellent rather than fine in this role. Early is when the answer is cheap to act on and before anyone has formed a settled view of you.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'And keep the mistake list',
          text: 'The habit that got you through this process - writing down what went wrong rather than what went right - is worth keeping. It is the same loop as the interview: attempt, review, adjust, repeat.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'ob-1',
      kind: 'concept',
      prompt: 'Your offer deadline is in a week and another company has not finished interviewing you. You should:',
      options: [
        'Accept the offer to be safe',
        'Ask for an extension - it is a normal request and usually granted',
        'Withdraw from the other process',
        'Let the deadline lapse and hope they renew',
      ],
      answerIndex: 1,
      explain:
        'Deadlines are typically one to four weeks and companies will usually accommodate an extension if they can.',
    },
    {
      id: 'ob-2',
      kind: 'technique',
      prompt: 'What makes a good reason for declining an offer?',
      options: [
        'One that is honest about the salary being too low',
        'One that is non-offensive and cannot be argued with, such as preferring a startup environment',
        'One that lists everything you disliked about the process',
        'No reason at all',
      ],
      answerIndex: 1,
      explain:
        'A large company cannot become a startup, so there is nothing to counter. Only give a fixable reason if you want it fixed.',
    },
    {
      id: 'ob-3',
      kind: 'technique',
      prompt: 'A company offers a 30k signing bonus. When comparing against another offer, you should:',
      options: [
        'Add the full 30k to the first year',
        'Amortise it over the time you expect to stay - about 10k a year over three years',
        'Ignore it, because it is one-time',
        'Double it, because it is paid immediately',
      ],
      answerIndex: 1,
      explain:
        'One-off money is real but one-off. Amortising puts it on the same footing as recurring compensation.',
    },
    {
      id: 'ob-4',
      kind: 'concept',
      prompt: 'A startup offers you 10,000 shares. The first thing to ask is:',
      options: [
        'What the shares are worth today',
        'What percentage of the company that represents, plus dilution, vesting, strike price and the post-departure exercise window',
        'Whether they can double it',
        'When the company will IPO',
      ],
      answerIndex: 1,
      explain:
        'Share count is meaningless without the total outstanding. A short exercise window on options you cannot afford can make a grant worth nothing.',
    },
    {
      id: 'ob-5',
      kind: 'concept',
      prompt: 'Why does having another live offer actually improve your negotiating position?',
      options: [
        'It proves you are talented',
        'Recruiters improve offers because they are worried you will not join - an alternative makes that worry concrete',
        'It lets you compare market rates',
        'It gives you more time to decide',
      ],
      answerIndex: 1,
      explain:
        'That worry is the entire mechanism. It is also why bluffing about an offer you do not have is both risky and unnecessary.',
    },
    {
      id: 'ob-6',
      kind: 'technique',
      prompt: 'Which negotiating ask is most effective?',
      options: [
        '"Is there any flexibility on the offer?"',
        '"Could you do another 10k on base? Based on the market for this level, I was hoping for around 175."',
        '"I need more money to accept."',
        '"What is the maximum you can pay?"',
      ],
      answerIndex: 1,
      explain:
        'Specific, slightly above target, and grounded in evidence. A vague ask can be satisfied with a token amount and technically honoured.',
    },
    {
      id: 'ob-7',
      kind: 'concept',
      prompt: 'At a large company, base pay barely moves however well you negotiate. The usual reason is:',
      options: [
        'The recruiter has no authority',
        'Pay is banded by level, so real increases beyond the band require being levelled higher',
        'They do not negotiate at all',
        'Budgets are set annually',
      ],
      answerIndex: 1,
      explain:
        'Arguing that your experience matches the next level up is a harder conversation and worth far more than a few thousand on base.',
    },
    {
      id: 'ob-8',
      kind: 'concept',
      prompt: 'You agree an extra 10k on a call with the recruiter. Before accepting, you should:',
      options: [
        'Nothing - a verbal agreement with a recruiter is binding',
        'Get the revised terms in the written offer, because after acceptance there is nothing left to trade with',
        'Ask for it to be paid as a signing bonus instead',
        'Confirm it with your future manager',
      ],
      answerIndex: 1,
      explain:
        'Recruiters move on and memories differ. Every negotiated change belongs in the document before you sign it.',
    },
    {
      id: 'ob-9',
      kind: 'technique',
      prompt: 'Which factor is most commonly overlooked when comparing offers in different cities?',
      options: [
        'The commute',
        'Whether other companies you would want to work for are nearby, since that shapes every future move',
        'The office layout',
        'The size of the engineering team',
      ],
      answerIndex: 1,
      explain:
        'Few local options means fewer future opportunities - and the effect compounds across your whole career, unlike a salary difference.',
    },
    {
      id: 'ob-10',
      kind: 'concept',
      prompt: 'Why interview roughly once a year even when you are happy in your job?',
      options: [
        'To pressure your manager for a raise',
        'It keeps the skill sharp, tells you what the market pays, and builds a connection you may want later',
        'Because offers expire',
        'To collect competing offers for a future negotiation',
      ],
      answerIndex: 1,
      explain:
        'You do not have to take the offer. The habit prevents both skill decay and the slow drift of not noticing your career has stalled.',
    },
  ],
  drills: [],
  practice: [
    {
      id: 'ob-comp-sheet',
      title: 'Build an offer comparison sheet before you need it',
      detail:
        'Columns: base, bonus, equity value per year (with your own assumptions written down), level, manager, team, learning, commute, risk. Fill it in the moment an offer arrives, not while under deadline pressure.',
    },
    {
      id: 'ob-number',
      title: 'Decide your number and your walk-away in advance',
      detail:
        'Research the band for the level in your market. Write down the number you will ask for and the one below which you decline. Deciding under pressure goes badly.',
    },
    {
      id: 'ob-script',
      title: 'Rehearse the negotiation script',
      detail:
        '"I am excited about the role. Based on the market for this level and my other conversations, I was hoping for X. Is there flexibility?" Then stop talking.',
    },
    {
      id: 'ob-equity-questions',
      title: 'Write the equity questions you will ask',
      detail:
        'What percentage of the company, what the last round valued it at, expected dilution, vesting and cliff, strike price, and how long you have to exercise after leaving. Ask all of them before you compare anything.',
    },
  ],
};
