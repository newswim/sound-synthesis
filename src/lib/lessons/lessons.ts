import type { Component } from 'svelte';
import Lesson1Sound from '../../lessons/Lesson1Sound.svelte';
import Lesson2Waveforms from '../../lessons/Lesson2Waveforms.svelte';
import Lesson3Pitch from '../../lessons/Lesson3Pitch.svelte';
import Lesson4Envelopes from '../../lessons/Lesson4Envelopes.svelte';
import Lesson5Filters from '../../lessons/Lesson5Filters.svelte';
import Lesson6Modulation from '../../lessons/Lesson6Modulation.svelte';
import Lesson7Wavetables from '../../lessons/Lesson7Wavetables.svelte';
import Lesson8SynthLab from '../../lessons/Lesson8SynthLab.svelte';

export interface Lesson {
  slug: string;
  title: string;
  blurb: string;
  component: Component<{ step: number; total: number }>;
}

export const lessons: Lesson[] = [
  { slug: 'sound', title: 'What is sound?', blurb: 'Frequency & amplitude', component: Lesson1Sound },
  { slug: 'waveforms', title: 'Waveforms', blurb: 'Shape & timbre', component: Lesson2Waveforms },
  { slug: 'pitch', title: 'Pitch & frequency', blurb: 'Notes, octaves, A440', component: Lesson3Pitch },
  { slug: 'envelopes', title: 'Envelopes (ADSR)', blurb: 'Shaping a note in time', component: Lesson4Envelopes },
  { slug: 'filters', title: 'Filters & EQ', blurb: 'Cutoff & resonance', component: Lesson5Filters },
  { slug: 'modulation', title: 'Modulation', blurb: 'LFO, vibrato & FM', component: Lesson6Modulation },
  { slug: 'wavetables', title: 'Wavetables', blurb: 'Additive synthesis', component: Lesson7Wavetables },
  { slug: 'synth-lab', title: 'Synth Lab', blurb: 'Build the whole chain', component: Lesson8SynthLab },
];

export function indexForSlug(slug: string): number {
  const i = lessons.findIndex((l) => l.slug === slug);
  return i < 0 ? 0 : i;
}
