/**
 * The header wordmark's glyph: a torii gate, same geometry as the app icon
 * (`scripts/gen-icons.mjs`) rendered as an inline SVG so it stays crisp at
 * any size and picks up `currentColor` from the header's accent treatment.
 */
export function BrandMark() {
  return (
    <svg
      className="header__mark"
      viewBox="0.7 1 22.6 21"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.2" y="2.5" width="19.6" height="3" rx="0.75" />
      <rect x="4" y="5.9" width="16" height="2.2" rx="0.55" />
      <rect x="5.1" y="6.67" width="2.8" height="13.83" rx="0.56" />
      <rect x="16.1" y="6.67" width="2.8" height="13.83" rx="0.56" />
    </svg>
  );
}
