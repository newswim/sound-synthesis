import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { installGlobalAudioUnlock } from './lib/audio/context';

installGlobalAudioUnlock();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
