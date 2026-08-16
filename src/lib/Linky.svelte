<script>
  // THE MASCOT.
  //
  // He is a drawing, not a diagram, so this component renders the drawing
  // and never tries to rebuild him in SVG. A traced approximation is a
  // different creature wearing his colours, which is worse than no mascot
  // at all — so `public/linky.png` is the only source of him on this site.
  //
  // What changes per appearance is how he sits, not how he is drawn:
  //
  //   idle   upright, breathing — the hero
  //   lean   tipped toward whatever is beside him
  //   peek   tucked against an edge, tilted in from it
  //
  //   <Linky pose="lean" size={140} />
  //
  // He is decorative everywhere he appears: the page says everything he
  // says, in words, next to him. So he ships with an empty alt and is
  // hidden from the accessibility tree rather than narrated twice.
  let { pose = 'idle', size = 160, flip = false, class: klass = '' } = $props()
</script>

<img
  src="/linky.png"
  alt=""
  aria-hidden="true"
  width={size}
  height={size}
  loading="lazy"
  decoding="async"
  class="linky {pose} {klass}"
  class:flip
  style="--size:{size}px"
/>

<style>
  .linky {
    /* the size prop is his desktop size; on a phone he has to give the
       headline the fold back, so he never takes more than a third of the
       width no matter what he was asked for */
    width: min(var(--size), 34vw);
    height: auto;
    /* he is a soft drawing; a hard shadow under him would be a costume,
       but a wide, low-opacity one reads as the paper he sits on */
    filter: drop-shadow(0 10px 18px rgba(38, 55, 74, 0.13));
  }

  .flip { transform: scaleX(-1); }

  /* the one authored motion on the page: he breathes */
  .idle { animation: breathe 5.2s ease-in-out infinite; }

  .lean { transform: rotate(-7deg); }
  .lean.flip { transform: scaleX(-1) rotate(-7deg); }

  .peek { transform: rotate(11deg); }
  .peek.flip { transform: scaleX(-1) rotate(11deg); }

  @keyframes breathe {
    0%,
    100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-9px) rotate(-1.5deg); }
  }
</style>
