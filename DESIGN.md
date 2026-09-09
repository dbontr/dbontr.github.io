# Design Contract — dbontr.github.io

## Concept
**Research Observatory** — a professional research portfolio presented as a computational instrument rather than a developer-template portfolio.

## Control dials
- Expression: 8/10
- Motion: 5/10
- Density: 5/10
- Interaction complexity: 2/10

## Hierarchy
1. Identity and research positioning.
2. Selected research systems.
3. Peer-reviewed publications.
4. About, methods, and external profiles.
5. Rendering colophon as a quiet technical detail.

## Visual language
- Near-black immersive hero and publication field.
- Warm technical-paper surface for work and biography.
- Cold blue-grey live implicit-field rendering with a single chartreuse signal color and rare warm-red telemetry point.
- No glass cards, pill-heavy UI, fake dashboards, terminal gimmicks, skill meters, or decorative metrics.
- Thin technical rules, restrained coordinates/indexes, and asymmetric editorial composition.

## Typography
- Primary: Helvetica Neue / Helvetica / Arial for neutral editorial authority and zero font-loading cost.
- Metadata: system monospace.
- Large display text uses deliberately tight tracking and occasional italic contrast.

## Signature
The hero contains a real-time WebGL implicit field generated from three moving attractors. The render is the sole cinematic device; it must never compromise content legibility or page performance.

## Motion
- Pointer movement only perturbs the virtual camera slightly.
- Simulation motion is slow and ambient.
- `prefers-reduced-motion` freezes the temporal component.
- Rendering pauses while the tab is hidden.

## Layout
- Full-viewport spatial hero.
- Editorial full-width rows rather than card grids.
- Content sections use an implied technical grid, collapsing semantically on narrow screens.

## Accessibility & resilience
- WCAG AA contrast target.
- Semantic headings, sections, articles, and navigation.
- Canvas is decorative and `aria-hidden`; all meaning exists in DOM content.
- Focus-visible state uses the signal color.
- No essential interaction requires hover.
- Mobile keeps the render but caps device pixel ratio aggressively.

## Performance rules
- No runtime framework.
- No external font dependency.
- WebGL1 shader only; static CSS background is the fallback.
- DPR capped at 1.45 desktop / 1.05 mobile.
- Rendering pauses in hidden tabs.
