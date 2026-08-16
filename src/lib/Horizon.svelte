<script>
  // Where the sky stops and the paper starts. Drawn rather than ruled: the
  // identity is hand-lettered, so the one structural edge on the page is
  // allowed a wobble. It is the only edge here that spends anything.
  //
  // `flip` turns it over, for the horizon the paper makes when it runs back
  // into the sky at the foot of the page.
  let { flip = false } = $props()
</script>

<svg
  class="horizon"
  class:flip
  viewBox="0 0 1200 40"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  <path
    fill="currentColor"
    d="M0 40 V23 C60 15 120 27 190 21 S320 9 400 19 S520 31 610 21 S740 7 830 17 S960 29 1050 19 S1150 11 1200 21 V40 Z"
  />
</svg>

<style>
  .flip { transform: rotate(180deg); }
</style>
