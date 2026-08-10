import type { CourseModule } from '../../types';

export const offerAndBeyond: CourseModule = {
  id: 'offer-and-beyond',
  title: 'The Offer & Beyond',
  track: 'process',
  status: 'outline',
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
  plannedAnimations: [
    'An equity comparison: two offers with the same headline number and very different expected value',
    'A negotiation timeline showing where leverage exists and where it disappears',
  ],
  sections: [],
  quiz: [],
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
  ],
};
