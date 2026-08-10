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

export const ALL_ANIMATIONS: AnimationSpec[] = [
  ...bigOAnimations,
  ...technicalQuestionsAnimations,
  ...arraysStringsAnimations,
  ...linkedListsAnimations,
  ...stacksQueuesAnimations,
];

const byId = new Map(ALL_ANIMATIONS.map((spec) => [spec.id, spec]));

export function getAnimation(id: string): AnimationSpec | undefined {
  return byId.get(id);
}
