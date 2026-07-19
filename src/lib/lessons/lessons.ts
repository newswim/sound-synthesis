import type { Component } from 'svelte';
import meta from './meta.json';
import Lesson1Sound from '../../lessons/Lesson1Sound.svelte';
import Lesson2Waveforms from '../../lessons/Lesson2Waveforms.svelte';
import Lesson3Pitch from '../../lessons/Lesson3Pitch.svelte';
import Lesson4Envelopes from '../../lessons/Lesson4Envelopes.svelte';
import Lesson5Filters from '../../lessons/Lesson5Filters.svelte';
import Lesson6Modulation from '../../lessons/Lesson6Modulation.svelte';
import Lesson7Wavetables from '../../lessons/Lesson7Wavetables.svelte';
import Lesson8SynthLab from '../../lessons/Lesson8SynthLab.svelte';
import LessonDelay from '../../lessons/LessonDelay.svelte';
import LessonChorus from '../../lessons/LessonChorus.svelte';
import LessonDistortion from '../../lessons/LessonDistortion.svelte';
import LessonReverb from '../../lessons/LessonReverb.svelte';
import LessonFxRack from '../../lessons/LessonFxRack.svelte';
import LessonPercussion from '../../lessons/LessonPercussion.svelte';
import LessonSignalChain from '../../lessons/LessonSignalChain.svelte';
import LessonChallenges from '../../lessons/LessonChallenges.svelte';

export interface LessonProps {
  step: number;
  total: number;
  section: string;
}

export interface Lesson {
  slug: string;
  title: string;
  blurb: string;
  /** Per-page meta description (also used by the prerender/sitemap script). */
  description: string;
  /** Labs integrate their section's concepts into one project. */
  lab?: boolean;
  component: Component<LessonProps>;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}

export const SITE = {
  name: meta.siteName,
  baseUrl: meta.baseUrl,
  title: meta.siteTitle,
  description: meta.siteDescription,
};

const COMPONENTS: Record<string, Component<LessonProps>> = {
  sound: Lesson1Sound,
  waveforms: Lesson2Waveforms,
  pitch: Lesson3Pitch,
  wavetables: Lesson7Wavetables,
  envelopes: Lesson4Envelopes,
  filters: Lesson5Filters,
  modulation: Lesson6Modulation,
  percussion: LessonPercussion,
  'synth-lab': Lesson8SynthLab,
  delay: LessonDelay,
  chorus: LessonChorus,
  distortion: LessonDistortion,
  reverb: LessonReverb,
  'fx-rack': LessonFxRack,
  'signal-chain': LessonSignalChain,
  challenges: LessonChallenges,
};

/** Curriculum: titles/blurbs/descriptions live in meta.json (shared with the
 *  prerender script); components are attached here by slug. */
export const sections: Section[] = meta.sections.map((s) => ({
  title: s.title,
  lessons: s.lessons.map((l) => ({ ...l, component: COMPONENTS[l.slug] })),
}));

export interface LessonEntry extends Lesson {
  section: string;
  step: number;
  total: number;
}

/** Flat, ordered list used for routing and prev/next. */
export const lessons: LessonEntry[] = sections.flatMap((s) =>
  s.lessons.map((l, i) => ({ ...l, section: s.title, step: i + 1, total: s.lessons.length })),
);

export function indexForSlug(slug: string): number {
  const i = lessons.findIndex((l) => l.slug === slug);
  return i < 0 ? 0 : i;
}
