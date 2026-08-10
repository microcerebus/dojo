import { Bars, Readout, Stage, type BarSpec } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Two offers with the same headline number.                              */
/* ------------------------------------------------------------------------ */

interface OfferFrame {
  a: number;
  b: number;
  caption: string;
  detail: string;
}

const offerFrames: OfferFrame[] = [
  {
    a: 160,
    b: 160,
    caption:
      'Two offers, both quoting a base of 160k. Most candidates compare exactly this number and stop, and it is the least informative part of the package.',
    detail: 'Offer A: large public company. Offer B: 60-person startup, Series B.',
  },
  {
    a: 170,
    b: 160,
    caption:
      'A pays a 30k signing bonus and relocation. Amortise one-off money over the time you expect to stay - three years here - so it is worth about 10k a year, not 30.',
    detail: 'A +10k/yr signing · B none · one-time money is real, but it is one-time',
  },
  {
    a: 186,
    b: 192,
    caption:
      'Annual bonus: A targets 10%, B targets 20%. Bonuses at tech companies range from about 3% to 30%, and recruiters will often tell you the average if you ask.',
    detail: 'A +16k · B +32k · ask what the target is AND what it actually paid out last year',
  },
  {
    a: 226,
    b: 252,
    caption:
      'Equity: A grants 40k a year in liquid public shares. B grants "60k a year" priced at the last funding round - a number that is not a price anyone has paid you.',
    detail: 'A +40k liquid · B +60k illiquid · treat these as different currencies until proven otherwise',
  },
  {
    a: 226,
    b: 216,
    caption:
      'Now discount B honestly: further rounds dilute you, the strike price and exercise window matter, and most startups do not produce a liquidity event. Halving it is generous, not pessimistic.',
    detail: 'B equity 60k → ~24k expected · ask about ownership percentage, dilution, vesting, strike price and post-departure exercise window',
  },
  {
    a: 226,
    b: 166,
    caption:
      'And cost of living. B is in a city roughly 30% more expensive on housing and taxes. Comparing gross numbers across cities compares nothing at all.',
    detail: 'The headline numbers were identical. What you would actually keep is not close.',
  },
  {
    a: 226,
    b: 166,
    caption:
      'Then set the whole calculation aside for a moment. What you learn, who you learn it from, and where the role puts you in three years usually move your lifetime earnings more than any of this.',
    detail:
      'Manager and teammates, growth of the team, promotion path, whether other companies you would want are nearby, and hours. Money is the easiest thing to compare and rarely the biggest term.',
  },
];

function OfferFrame({ index }: { index: number }) {
  const frame = offerFrames[Math.max(0, Math.min(index, offerFrames.length - 1))];
  const bars: BarSpec[] = [
    {
      key: 'a',
      label: 'offer A',
      value: frame.a / 260,
      caption: `${frame.a}k`,
      state: frame.a >= frame.b ? 'done' : 'idle',
    },
    {
      key: 'b',
      label: 'offer B',
      value: frame.b / 260,
      caption: `${frame.b}k`,
      state: frame.b > frame.a ? 'done' : 'idle',
    },
  ];
  return (
    <Stage>
      <Bars bars={bars} height={150} />
      <Readout
        items={[
          { key: 'a', label: 'offer A', value: `${frame.a}k` },
          { key: 'b', label: 'offer B', value: `${frame.b}k` },
          { key: 'd', label: 'gap', value: `${Math.abs(frame.a - frame.b)}k` },
        ]}
      />
    </Stage>
  );
}

export const offerComparison: AnimationSpec = fromFrames(
  {
    id: 'ob-equity',
    title: 'Same headline, different offer',
    blurb: 'Amortise the one-offs, discount the illiquid, adjust for where you live - then look at everything else.',
  },
  offerFrames,
  OfferFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Where the leverage is.                                                 */
/* ------------------------------------------------------------------------ */

const STAGES = [
  {
    key: 'apply',
    label: 'applying',
    leverage: 5,
    detail: 'None to speak of. Anything you say about compensation here becomes an anchor you will not be able to move later.',
  },
  {
    key: 'interview',
    label: 'interviewing',
    leverage: 15,
    detail: 'Still very little. If asked for a number now, deflect to "I would rather hear the range for the level" - honestly, and without a figure.',
  },
  {
    key: 'offer',
    label: 'offer arrives',
    leverage: 70,
    detail: 'Everything changes here. They have chosen you, spent real money doing it, and would rather pay a little more than start again. Nobody withdraws an offer because you negotiated.',
  },
  {
    key: 'window',
    label: 'the window',
    leverage: 100,
    detail: 'Peak leverage: another live offer, or an honest, specific ask backed by market data. Deadlines are usually one to four weeks, and asking to extend is normal and routinely granted.',
  },
  {
    key: 'accept',
    label: 'you accept',
    leverage: 5,
    detail: 'It collapses the moment you say yes. Everything you agreed must already be in writing, because there is nothing left to trade with.',
  },
  {
    key: 'inside',
    label: 'on the job',
    leverage: 20,
    detail: 'Rebuilds slowly, on the review cycle and within a band. A raise cycle almost never recovers what a level or a starting number gave away.',
  },
];

const leverageFrames = [
  {
    caption:
      'Negotiating leverage is not constant. It appears at one moment, peaks briefly, and disappears the second you accept - so the whole game is about what you do inside that window.',
    detail: 'Students in a negotiation class said they would pay 750 dollars to avoid an hour of haggling. Most of them also never negotiated a job offer.',
  },
  ...STAGES.map((stage) => ({
    caption: `${stage.label}: ${stage.detail}`,
    detail: `relative leverage: ${stage.leverage}%`,
  })),
  {
    caption:
      'Inside the window: ask for something specific rather than "more", overshoot slightly because they will meet you in between, and ask about the whole package - level, signing bonus, equity, start date, flexibility - since non-salary components are often easier for them to move.',
    detail:
      'At a large company, base pay is bounded by your level. A big jump means convincing them of a higher level, which is harder but not impossible - and worth far more.',
  },
];

function LeverageFrame({ index }: { index: number }) {
  const step = Math.max(0, Math.min(index, leverageFrames.length - 1)) - 1;
  const bars: BarSpec[] = STAGES.map((stage, i) => ({
    key: stage.key,
    label: stage.label,
    value: stage.leverage / 100,
    caption: `${stage.leverage}`,
    state: step === i ? 'active' : step < 0 || step >= STAGES.length ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <Bars bars={bars} />
      <Readout
        items={[
          { key: 's', label: 'stage', value: step < 0 || step >= STAGES.length ? 'all' : STAGES[step].label },
          { key: 'p', label: 'peak', value: 'between offer and acceptance' },
        ]}
      />
    </Stage>
  );
}

export const leverageTimeline: AnimationSpec = fromFrames(
  {
    id: 'ob-leverage',
    title: 'Where the leverage is',
    blurb: 'It arrives with the offer and vanishes when you accept. Everything happens in between.',
  },
  leverageFrames,
  LeverageFrame,
);

export const offerAndBeyondAnimations: AnimationSpec[] = [offerComparison, leverageTimeline];
