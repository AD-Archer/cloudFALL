/**
 * The shop is a shelf of blank discs, so the question a card has to answer is
 * "how much of my library does this hold?" and that number is sitting in the
 * product name already ("Verbatim BD-R 25GB - 10pk Spindle" → 250 GB).
 *
 * Parsed rather than hand-maintained, because the shop is edited in Stern and
 * nothing here should need a redeploy when a new spindle is listed. Anything
 * that does not look like discs (a Plex plan, a drive) returns null and the
 * card simply does without the line.
 */
const SIZE = /(\d+(?:\.\d+)?)\s*(TB|GB|MB)\b/i;
const COUNT = /(\d+)\s*-?\s*(?:pk\b|pack\b|discs?\b)/i;

const IN_MB = { mb: 1, gb: 1000, tb: 1000000 };

function format(mb) {
  if (mb >= 1000000) return `${trim(mb / 1000000)} TB`;
  if (mb >= 1000) return `${trim(mb / 1000)} GB`;
  return `${trim(mb)} MB`;
}

// 1.0 TB reads as a rounding artifact; 1 TB reads as a fact
const trim = (n) => String(Number(n.toFixed(n < 10 ? 1 : 0)));

export function capacity(...sources) {
  const text = sources.filter(Boolean).join(" ");
  const size = text.match(SIZE);
  if (!size) return null;

  const each = Number.parseFloat(size[1]);
  const unit = IN_MB[size[2].toLowerCase()];
  if (!Number.isFinite(each) || !unit) return null;

  const found = text.match(COUNT);
  const count = found ? Number.parseInt(found[1], 10) : 1;
  if (!Number.isFinite(count) || count < 1) return null;

  return {
    count,
    each: format(each * unit),
    total: format(each * unit * count),
    // "10 × 25 GB" only earns its space when there is more than one of them
    breakdown: count > 1 ? `${count} × ${format(each * unit)}` : "",
  };
}
