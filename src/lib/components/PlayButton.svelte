<script lang="ts">
  import { unlockAudio } from '../audio/context';

  interface Props {
    playing: boolean;
    onToggle: (playing: boolean) => void;
    labelOn?: string;
    labelOff?: string;
  }

  let { playing, onToggle, labelOn = 'Stop', labelOff = 'Play' }: Props = $props();

  async function handle() {
    await unlockAudio();
    onToggle(!playing);
  }
</script>

<button
  onclick={handle}
  class="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition active:scale-95"
  class:bg-warn={playing}
  style={playing
    ? 'background:var(--color-warn);color:#1a1205'
    : 'background:var(--color-accent);color:#04201b'}
>
  <span class="text-base leading-none">{playing ? '■' : '▶'}</span>
  {playing ? labelOn : labelOff}
</button>
