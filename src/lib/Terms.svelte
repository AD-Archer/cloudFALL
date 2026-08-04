<script>
  // For anyone who has never done a Hack Club YSWS and does not yet know what
  // "ship" means here. It sits directly above the shop because three of the
  // four rows are the terms the shop runs on: who can claim, how many there
  // are, and what makes an hour count.
  //
  // A definition list, not another row of cards these are the terms of the
  // thing, and terms belong in a spec plate.
  import { TERMS } from './data.js'

  let { slackUrl = '', hackatimeUrl = '', welcomeUrl = '' } = $props()
</script>

<dl class="facts">
  {#each TERMS as f}
    <div class="fact">
      <dt class="mono">{f.term}</dt>
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
    <a class="quiet" href={hackatimeUrl} data-analytics="CTA: Click" data-analytics-placement="terms-hackatime">What is Hackatime?</a>
  {/if}
</p>

<style>
  .facts { margin: 0; }

  /* the term column is fixed, so all four statements start on one axis and the
     block reads as a plate of terms rather than four stacked paragraphs */
  .fact {
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    gap: 20px;
    align-items: baseline;
    padding: 13px 2px;
    border-top: 1px solid var(--rule-2);
  }
  .fact:first-child { border-top: none; }
  .fact dt { font-size: 0.68rem; color: var(--ember); }
  .fact dd { margin: 0; color: var(--ink-2); max-width: 68ch; }

  .tail {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--rule-2);
    color: var(--ink-3);
    font-size: 0.92rem;
    max-width: 76ch;
  }
  .tail a { color: var(--ink); box-shadow: inset 0 -1px 0 var(--ember); }
  .tail a:hover { color: var(--ember); }
  .tail .quiet { margin-left: 6px; color: var(--ink-3); box-shadow: none; }
  .tail .quiet:hover { color: var(--ember); }

  @media (max-width: 640px) {
    /* the term becomes an eyebrow above its statement; a fixed column would
       leave the text about twelve characters wide on a phone */
    .fact { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  }
</style>
