<script lang="ts">
  import Section from './Section.svelte'
  import { layouts } from './layouts'
</script>

<div style="font-family:system-ui, sans-serif;padding:24px;max-width:940px;margin:0 auto">
  {#each layouts as spec (spec.id)}
    <Section {spec} />
  {/each}
</div>
