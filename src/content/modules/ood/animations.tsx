import {
  Chips,
  FlowSteps,
  Legend,
  Readout,
  Stage,
  TreeViz,
  type CellState,
  type ChipSpec,
  type FlowStepSpec,
  type TreeNodeSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The four-step method, run on "design a parking lot".                   */
/* ------------------------------------------------------------------------ */

interface MethodFrame {
  step: number;
  nouns: { label: string; state: CellState }[];
  caption: string;
  detail: string;
}

const METHOD: { label: string; detail: string }[] = [
  {
    label: 'Handle ambiguity',
    detail:
      'Who uses it, how, and at what scale? One lot or a chain? Which vehicle types? Do we bill?',
  },
  {
    label: 'Define the core objects',
    detail: 'The handful of nouns the problem is actually about. Resist inventing more.',
  },
  {
    label: 'Analyse relationships',
    detail: 'Which object holds which? What is one-to-many, what is many-to-many, what is is-a?',
  },
  {
    label: 'Investigate actions',
    detail: 'Walk a real use case through. Missing objects show up here, not before.',
  },
];

const methodFrames: MethodFrame[] = [
  {
    step: 0,
    nouns: [],
    caption:
      '"Design a parking lot" is deliberately vague. Before a single class, ask who uses it and how. Multiple levels? Motorcycles and buses, or only cars? Is payment in scope?',
    detail: 'assumption: multi-level lot · motorcycle, car, bus · no billing',
  },
  {
    step: 1,
    nouns: [
      { label: 'ParkingLot', state: 'active' },
      { label: 'Level', state: 'active' },
      { label: 'Spot', state: 'active' },
      { label: 'Vehicle', state: 'active' },
    ],
    caption:
      'Four core objects fall straight out of the clarified problem. Notice what is absent: no SpotFinder, no ParkingManager, no AbstractVehicleFactory. Nouns first, machinery later.',
    detail: '4 objects · each one is a thing the customer would name',
  },
  {
    step: 2,
    nouns: [
      { label: 'ParkingLot', state: 'done' },
      { label: 'Level', state: 'done' },
      { label: 'Spot', state: 'done' },
      { label: 'Vehicle', state: 'compare' },
    ],
    caption:
      'Relationships: a lot has many levels, a level has many spots, a spot holds at most one vehicle. Car, Bus and Motorcycle are-a Vehicle - real is-a, because a bus genuinely is a vehicle.',
    detail: 'ParkingLot 1→n Level 1→n Spot · Spot 0..1 Vehicle · Car/Bus/Motorcycle is-a Vehicle',
  },
  {
    step: 2,
    nouns: [
      { label: 'ParkingLot', state: 'done' },
      { label: 'Level', state: 'done' },
      { label: 'Spot', state: 'target' },
      { label: 'Vehicle', state: 'done' },
    ],
    caption:
      'Resist the second hierarchy. LargeSpot, CompactSpot and MotorcycleSpot behave identically - they only differ in size. That is a field on Spot, not three subclasses.',
    detail: 'Spot { size: Motorcycle | Compact | Large } · one class, not four',
  },
  {
    step: 3,
    nouns: [
      { label: 'ParkingLot', state: 'done' },
      { label: 'Level', state: 'active' },
      { label: 'Spot', state: 'done' },
      { label: 'Vehicle', state: 'done' },
    ],
    caption:
      'Walk a use case: a bus arrives. It needs five consecutive large spots in one row. Who searches? Level knows its own rows, so Level.findSpots(vehicle) belongs there and ParkingLot just asks each level in turn.',
    detail: 'park(bus) → lot asks each Level → Level scans its rows → Spot.park(vehicle)',
  },
  {
    step: 3,
    nouns: [
      { label: 'ParkingLot', state: 'done' },
      { label: 'Level', state: 'done' },
      { label: 'Spot', state: 'done' },
      { label: 'Vehicle', state: 'done' },
    ],
    caption:
      'The use case also exposes what was missing: leaving. Spot.remove() has to tell its Level that a space freed up, or the free-spot count silently drifts. Walking the actions is how you find that.',
    detail: 'every design gap this small is found by walking use cases, never by staring',
  },
];

function MethodFrameView({ index }: { index: number }) {
  const frame = methodFrames[Math.min(Math.max(index, 0), methodFrames.length - 1)];
  const steps: FlowStepSpec[] = METHOD.map((item, i) => ({
    key: item.label,
    label: item.label,
    ...(i === frame.step ? { detail: item.detail } : {}),
    state: i === frame.step ? 'active' : i < frame.step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
      {frame.nouns.length > 0 ? (
        <Chips
          chips={frame.nouns.map((noun) => ({
            key: noun.label,
            label: noun.label,
            state: noun.state,
          }))}
          label="core objects"
        />
      ) : null}
    </Stage>
  );
}

export const oodMethod: AnimationSpec = fromFrames(
  {
    id: 'ood-method',
    title: 'Four steps, on a parking lot',
    blurb: 'Clarify, name the objects, draw the relationships, then walk a use case through.',
  },
  methodFrames,
  MethodFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Inheritance explodes; composition does not.                            */
/* ------------------------------------------------------------------------ */

interface CompFrame {
  mode: 'inherit' | 'compose';
  depth: number;
  slots: number;
  nodes: TreeNodeSpec[];
  classes: number;
  caption: string;
  detail: string;
}

const n = (
  key: string,
  label: string,
  depth: number,
  slot: number,
  state: TreeNodeSpec['state'],
  parentSlot?: number,
): TreeNodeSpec => ({
  key,
  label,
  depth,
  slot,
  state,
  ...(parentSlot === undefined ? {} : { parentSlot }),
});

const compFrames: CompFrame[] = [
  {
    mode: 'inherit',
    depth: 2,
    slots: 4,
    classes: 4,
    nodes: [
      n('v', 'Vehicle', 0, 1.5, 'active'),
      n('c', 'Car', 1, 0, 'done', 1.5),
      n('b', 'Bus', 1, 1.5, 'done', 1.5),
      n('m', 'Bike', 1, 3, 'done', 1.5),
    ],
    caption:
      'Inheritance starts out looking perfect. Car, Bus and Motorcycle really are vehicles, and they share size, licence plate and the spots they fit in.',
    detail: '4 classes · one axis of variation: vehicle kind',
  },
  {
    mode: 'inherit',
    depth: 3,
    slots: 6,
    classes: 7,
    nodes: [
      n('v', 'Vehicle', 0, 2.5, 'idle'),
      n('c', 'Car', 1, 0.5, 'idle', 2.5),
      n('b', 'Bus', 1, 2.5, 'idle', 2.5),
      n('m', 'Bike', 1, 4.5, 'idle', 2.5),
      n('ec', 'ElectricCar', 2, 0, 'bad', 0.5),
      n('eb', 'ElectricBus', 2, 2, 'bad', 2.5),
      n('em', 'ElectricBike', 2, 4, 'bad', 4.5),
    ],
    caption:
      'Then a second axis arrives: some vehicles are electric and need a charging spot. Inheritance can only express one axis, so the tree multiplies - one subclass per combination.',
    detail: '7 classes · 2 axes · the next axis (self-driving) makes it 14',
  },
  {
    mode: 'compose',
    depth: 2,
    slots: 4,
    classes: 2,
    nodes: [
      n('v', 'Vehicle', 0, 1.5, 'active'),
      n('k', 'kind', 1, 0.4, 'done', 1.5),
      n('p', 'powertrain', 1, 2.6, 'done', 1.5),
    ],
    caption:
      'Composition holds both axes at once. A Vehicle has a kind and has a powertrain. Adding self-driving adds one more field, not seven more classes.',
    detail: '1 class + 2 small value types · axes are independent, as they are in reality',
  },
  {
    mode: 'compose',
    depth: 2,
    slots: 4,
    classes: 2,
    nodes: [
      n('v', 'Vehicle', 0, 1.5, 'done'),
      n('k', 'kind', 1, 0.4, 'target'),
      n('p', 'powertrain', 1, 2.6, 'target'),
    ],
    caption:
      'The test to apply out loud: is-a survives substitution forever ("a bus is always a vehicle"), has-a survives change ("this vehicle is electric today"). If the trait can change, it is a field.',
    detail: 'inherit for identity · compose for behaviour and for anything mutable',
  },
];

function CompFrameView({ index }: { index: number }) {
  const frame = compFrames[Math.min(Math.max(index, 0), compFrames.length - 1)];
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'm', label: 'modelled by', value: frame.mode === 'inherit' ? 'inheritance' : 'composition' },
          { key: 'c', label: 'types', value: String(frame.classes) },
        ]}
      />
      <TreeViz nodes={frame.nodes} slots={frame.slots} depth={frame.depth} />
      <Legend
        items={[
          { key: 'a', state: 'done', label: 'pulls its weight' },
          { key: 'b', state: 'bad', label: 'exists only to combine two traits' },
        ]}
      />
    </Stage>
  );
}

export const oodComposition: AnimationSpec = fromFrames(
  {
    id: 'ood-composition',
    title: 'Composition over inheritance',
    blurb: 'The same problem modelled twice. Watch what a second axis of variation costs each one.',
  },
  compFrames,
  CompFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. State machine for a parking spot.                                      */
/* ------------------------------------------------------------------------ */

const STATES = ['Free', 'Reserved', 'Occupied', 'OutOfService'] as const;

interface StateFrame {
  current: number;
  legal: number[];
  caption: string;
  detail: string;
}

const stateFrames: StateFrame[] = [
  {
    current: 0,
    legal: [1, 2, 3],
    caption:
      'Model status as an enum plus the moves that are legal from each value - not as three loose booleans. Three booleans have eight combinations, and half of them are nonsense.',
    detail: 'isFree · isReserved · isBroken → 8 combinations, 4 of them impossible',
  },
  {
    current: 1,
    legal: [0, 2],
    caption:
      'From Reserved a spot can be taken up or the reservation can lapse back to Free. It cannot go straight to OutOfService while someone holds a claim on it - that transition simply is not in the table.',
    detail: 'Reserved → { Free, Occupied }',
  },
  {
    current: 2,
    legal: [0],
    caption:
      'From Occupied there is exactly one legal move: the vehicle leaves. Writing that down is what stops a second car being parked in a taken spot, in every code path at once.',
    detail: 'Occupied → { Free }',
  },
  {
    current: 3,
    legal: [0],
    caption:
      'OutOfService only returns to Free, and only via maintenance. The enum plus this table is the specification - it is far easier to defend in an interview than scattered if-statements.',
    detail: 'OutOfService → { Free }',
  },
  {
    current: 0,
    legal: [1, 2, 3],
    caption:
      'Put the transition in one method - spot.transitionTo(next) - and rejecting an illegal move becomes one lookup. Every caller gets the rule for free, including the ones written next year.',
    detail: 'one enum · one table · one guarded method',
  },
];

function StateFrameView({ index }: { index: number }) {
  const frame = stateFrames[Math.min(Math.max(index, 0), stateFrames.length - 1)];
  const chips: ChipSpec[] = STATES.map((label, i) => ({
    key: label,
    label,
    state: i === frame.current ? 'active' : frame.legal.includes(i) ? 'target' : 'muted',
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 'c', label: 'state', value: STATES[frame.current] },
          {
            key: 'l',
            label: 'legal next',
            value: frame.legal.map((i) => STATES[i]).join(', '),
          },
        ]}
      />
      <Chips chips={chips} label="spot states" />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'current' },
          { key: 'b', state: 'target', label: 'legal transition' },
          { key: 'c', state: 'muted', label: 'rejected' },
        ]}
      />
    </Stage>
  );
}

export const oodStateMachine: AnimationSpec = fromFrames(
  {
    id: 'ood-state-machine',
    title: 'State as an enum plus a table',
    blurb: 'A parking spot has four states and eight legal moves. Booleans cannot say that.',
  },
  stateFrames,
  StateFrameView,
);

export const oodAnimations: AnimationSpec[] = [oodMethod, oodComposition, oodStateMachine];
