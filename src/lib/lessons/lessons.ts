import type { Component } from 'svelte';
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

export interface LessonProps {
  step: number;
  total: number;
  section: string;
}

export interface Lesson {
  slug: string;
  title: string;
  blurb: string;
  /** Labs integrate their section's concepts into one project. */
  lab?: boolean;
  component: Component<LessonProps>;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}

/** Curriculum: sections of lessons, each culminating in a lab. */
export const sections: Section[] = [
  {
    title: 'Basics',
    lessons: [
      { slug: 'sound', title: 'What is sound?', blurb: 'Frequency & amplitude', component: Lesson1Sound },
      { slug: 'waveforms', title: 'Waveforms', blurb: 'Shape & timbre', component: Lesson2Waveforms },
      { slug: 'pitch', title: 'Pitch & frequency', blurb: 'Notes, octaves, A440', component: Lesson3Pitch },
      { slug: 'wavetables', title: 'Wave Builder', blurb: 'Lab · additive synthesis', lab: true, component: Lesson7Wavetables },
    ],
  },
  {
    title: 'Shaping',
    lessons: [
      { slug: 'envelopes', title: 'Envelopes (ADSR)', blurb: 'Shaping a note in time', component: Lesson4Envelopes },
      { slug: 'filters', title: 'Filters & EQ', blurb: 'Cutoff & resonance', component: Lesson5Filters },
      { slug: 'modulation', title: 'Modulation', blurb: 'LFO, vibrato & FM', component: Lesson6Modulation },
      { slug: 'percussion', title: 'Noise & percussion', blurb: 'Drums from static', component: LessonPercussion },
      { slug: 'synth-lab', title: 'Synth Lab', blurb: 'Lab · the subtractive chain', lab: true, component: Lesson8SynthLab },
    ],
  },
  {
    title: 'Effects',
    lessons: [
      { slug: 'delay', title: 'Delay & feedback', blurb: 'Echoes & feedback loops', component: LessonDelay },
      { slug: 'chorus', title: 'Chorus & flanger', blurb: 'One delay, modulated', component: LessonChorus },
      { slug: 'distortion', title: 'Distortion', blurb: 'Clipping creates harmonics', component: LessonDistortion },
      { slug: 'reverb', title: 'Reverb', blurb: 'Rooms from noise', component: LessonReverb },
      { slug: 'fx-rack', title: 'FX Rack', blurb: 'Lab · chain the pedals', lab: true, component: LessonFxRack },
    ],
  },
];

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
