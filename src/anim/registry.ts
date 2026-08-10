/**
 * Every animation in the app, keyed by id. Lesson content refers to animations
 * by id (`{ kind: 'anim', animId }`), so a lesson stays plain data.
 */
import type { AnimationSpec } from './types';
import { bigOAnimations } from '../content/modules/big-o/animations';
import { technicalQuestionsAnimations } from '../content/modules/technical-questions/animations';
import { arraysStringsAnimations } from '../content/modules/arrays-strings/animations';
import { linkedListsAnimations } from '../content/modules/linked-lists/animations';
import { stacksQueuesAnimations } from '../content/modules/stacks-queues/animations';
import { treesGraphsAnimations } from '../content/modules/trees-graphs/animations';
import { heapsTriesAnimations } from '../content/modules/heaps-tries/animations';
import { oodAnimations } from '../content/modules/ood/animations';
import { systemDesignAnimations } from '../content/modules/system-design/animations';
import { cCppAnimations } from '../content/modules/c-cpp/animations';
import { javaAnimations } from '../content/modules/java/animations';
import { databasesAnimations } from '../content/modules/databases/animations';
import { threadsLocksAnimations } from '../content/modules/threads-locks/animations';
import { mathLogicAnimations } from '../content/modules/math-logic/animations';
import { advancedTopicsAnimations } from '../content/modules/advanced-topics/animations';
import { testingAnimations } from '../content/modules/testing/animations';
import { interviewProcessAnimations } from '../content/modules/interview-process/animations';
import { behindTheScenesAnimations } from '../content/modules/behind-the-scenes/animations';
import { specialSituationsAnimations } from '../content/modules/special-situations/animations';
import { beforeTheInterviewAnimations } from '../content/modules/before-the-interview/animations';
import { behavioralAnimations } from '../content/modules/behavioral/animations';
import { offerAndBeyondAnimations } from '../content/modules/offer-and-beyond/animations';
import { bitManipulationAnimations } from '../content/modules/bit-manipulation/animations';
import { recursionDpAnimations } from '../content/modules/recursion-dp/animations';
import { sortingSearchingAnimations } from '../content/modules/sorting-searching/animations';
import { moderateAnimations } from '../content/modules/moderate/animations';
import { hardAnimations } from '../content/modules/hard/animations';

export const ALL_ANIMATIONS: AnimationSpec[] = [
  ...bigOAnimations,
  ...technicalQuestionsAnimations,
  ...arraysStringsAnimations,
  ...linkedListsAnimations,
  ...stacksQueuesAnimations,
  ...treesGraphsAnimations,
  ...heapsTriesAnimations,
  ...oodAnimations,
  ...systemDesignAnimations,
  ...cCppAnimations,
  ...javaAnimations,
  ...databasesAnimations,
  ...threadsLocksAnimations,
  ...mathLogicAnimations,
  ...advancedTopicsAnimations,
  ...testingAnimations,
  ...interviewProcessAnimations,
  ...behindTheScenesAnimations,
  ...specialSituationsAnimations,
  ...beforeTheInterviewAnimations,
  ...behavioralAnimations,
  ...offerAndBeyondAnimations,
  ...bitManipulationAnimations,
  ...recursionDpAnimations,
  ...sortingSearchingAnimations,
  ...moderateAnimations,
  ...hardAnimations,
];

const byId = new Map(ALL_ANIMATIONS.map((spec) => [spec.id, spec]));

export function getAnimation(id: string): AnimationSpec | undefined {
  return byId.get(id);
}
