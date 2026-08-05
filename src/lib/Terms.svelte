<script>
  // For anyone who has never done a Hack Club YSWS and does not yet know what
  // "ship" means here. It sits directly above the shop because three of the
  // four rows are the terms the shop runs on: who can claim, how many there
  // are, and what makes an hour count.
  //
  // A definition list, not another row of cards. These are the terms of the
  // thing, and terms belong in a ruled list.
  import { TERMS } from './data.js'

  let { slackUrl = '', hackatimeUrl = '', welcomeUrl = '' } = $props()
</script>

<dl class="facts">
  {#each TERMS as f}
    <div class="fact">
      <dt class="pill">{f.term}</dt>
      <dd>{f.body}</dd>
    </div>
  {/each}
</dl>

<p class="tail">
  Not sure where to start?
  {#if welcomeUrl}
    <a href={welcomeUrl} data-analytics="CTA: Click" data-analytics-placement="terms-onboarding">Sign up</a>{#if slackUrl}, or{/if}
  {/if}
  {#if slackUrl}<a href={slackUrl} data-analytics="CTA: Click" data-analytics-placement="terms-slack">ask in #ysws-cloudfall</a>{/if}.
  Somebody in there is already running the exact stack you are about to build.
  {#if hackatimeUrl}
    <a href={hackatimeUrl} data-analytics="CTA: Click" data-analytics-placement="terms-hackatime">What is Hackatime?</a>
  {/if}
</p>

<style>
  .facts { margin: 0; display: grid; }

  /* the term column is fixed, so all four statements start on one axis and the
     block reads as one list rather than four stacked paragraphs */
  .fact {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 24px;
    align-items: baseline;
    padding: 18px 0;
    border-top: 1px solid var(--rule);
  }
  .fact:last-child { border-bottom: 1px solid var(--rule); }
  .fact dt { justify-self: start; padding-top: 4px; }
  .fact dd { margin: 0; color: var(--ink-2); max-width: 66ch; }

  .tail {
    margin-top: clamp(26px, 4vw, 40px);
    color: var(--ink-2);
    max-width: 72ch;
  }
  .tail a { color: var(--ink); text-underline-offset: 3px; }
  .tail a:hover { color: var(--ember-ink); }

  @media (max-width: 640px) {
    /* the term becomes an eyebrow above its statement; a fixed column would
       leave the text about twelve characters wide on a phone */
    .fact { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .fact dt { padding-top: 0; }
  }
</style>
