import type { CourseModule } from '../../types';

export const specialSituations: CourseModule = {
  id: 'special-situations',
  title: 'Special Situations',
  track: 'process',
  status: 'outline',
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
  plannedAnimations: [
    'A matrix of role vs what each round weights, so you can see where to spend prep time',
  ],
  sections: [],
  quiz: [],
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
  ],
};
