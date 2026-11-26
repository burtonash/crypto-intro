// One lesson source, two render targets (PRD risk: "Stage Mode drifts from Explore Mode").
import { readState } from './state.js';
import { runStage } from './stage.js';
import { runExplore } from './explore.js';

export function boot(lesson) {
  const state = readState(lesson.defaults);
  return state.stage ? runStage(lesson, state) : runExplore(lesson, state);
}
