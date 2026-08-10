/**
 * The module registry. Adding a module is: create `modules/<id>/index.ts`,
 * import it here, and add it to the array.
 */
import type { CourseModule, Track } from './types';

import { bigO } from './modules/big-o';
import { technicalQuestions } from './modules/technical-questions';
import { arraysStrings } from './modules/arrays-strings';
import { linkedLists } from './modules/linked-lists';
import { stacksQueues } from './modules/stacks-queues';
import { treesGraphs } from './modules/trees-graphs';
import { heapsTries } from './modules/heaps-tries';
import { recursionDp } from './modules/recursion-dp';
import { sortingSearching } from './modules/sorting-searching';
import { bitManipulation } from './modules/bit-manipulation';
import { mathLogic } from './modules/math-logic';
import { testing } from './modules/testing';
import { moderate } from './modules/moderate';
import { hard } from './modules/hard';
import { advancedTopics } from './modules/advanced-topics';
import { ood } from './modules/ood';
import { systemDesign } from './modules/system-design';
import { interviewProcess } from './modules/interview-process';
import { behindTheScenes } from './modules/behind-the-scenes';
import { specialSituations } from './modules/special-situations';
import { beforeTheInterview } from './modules/before-the-interview';
import { behavioral } from './modules/behavioral';
import { offerAndBeyond } from './modules/offer-and-beyond';
import { cCpp } from './modules/c-cpp';
import { java } from './modules/java';
import { databases } from './modules/databases';
import { threadsLocks } from './modules/threads-locks';

export const MODULES: CourseModule[] = [
  // Core DSA
  arraysStrings,
  linkedLists,
  stacksQueues,
  treesGraphs,
  heapsTries,
  recursionDp,
  sortingSearching,
  bitManipulation,
  // Techniques
  bigO,
  technicalQuestions,
  mathLogic,
  testing,
  moderate,
  hard,
  advancedTopics,
  // Design
  ood,
  systemDesign,
  // Process
  interviewProcess,
  behindTheScenes,
  specialSituations,
  beforeTheInterview,
  behavioral,
  offerAndBeyond,
  // Reference
  cCpp,
  java,
  databases,
  threadsLocks,
];

const byId = new Map(MODULES.map((courseModule) => [courseModule.id, courseModule]));

export function getModule(id: string): CourseModule | undefined {
  return byId.get(id);
}

export function modulesInTrack(track: Track): CourseModule[] {
  return MODULES.filter((courseModule) => courseModule.track === track);
}

export { TRACKS } from './types';
export type { CourseModule, Track } from './types';
