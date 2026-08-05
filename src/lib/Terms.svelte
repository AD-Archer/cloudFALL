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
    <a class="quiet" href={hackatimeUrl} data-analytics="CTA: Click" data-analytics-placement="terms-hackatime">What is Hackatime?</a>
  {/if}
</p>

<style>
  .facts { margin: 0; display: grid; gap: 8px; }

  /* the term column is fixed, so all four statements start on one axis and the
     block reads as one plate rather than four stacked paragraphs */
  .fact {
    display: grid;
    grid-template-columns: 138px minmax(0, 1fr);
    gap: 18px;
    align-items: baseline;
    padding: 14px 18px 15px;
    border-radius: var(--r);
    background: var(--cloud-2);
  }
  .fact dt { justify-self: start; }
  .fact dd { margin: 0; color: var(--ink-2); max-width: 68ch; }

  .tail {
    margin-top: 16px;
    padding: 0 4px;
    color: var(--ink-3);
    font-size: 0.94rem;
    max-width: 76ch;
  }
  .tail a { color: var(--violet); font-weight: 700; }
  .tail a:hover { color: var(--ink); }
  .tail .quiet { margin-left: 6px; color: var(--ink-3); font-weight: 400; }
  .tail .quiet:hover { color: var(--violet); }

  @media (max-width: 640px) {
    /* the term becomes an eyebrow above its statement; a fixed column would
       leave the text about twelve characters wide on a phone */
    .fact { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 13px 15px 14px; }
  }
</style>
