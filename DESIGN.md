# Design Contract — dbontr.github.io

## Concept
**Research Profile** — a personal academic website for a serious technical researcher. The work, publications, and research interests carry the page; visual design exists to improve credibility and reading rather than to perform for the visitor.

## Control dials
- Expression: 3/10
- Motion: 0/10
- Density: 3/10
- Interaction complexity: 1/10

## Hierarchy
1. Name, affiliation, and concise research statement.
2. Peer-reviewed publications.
3. Selected technical research and systems.
4. Biography, research focus, methods, and external profiles.

## Visual language
- Warm archival paper rather than pure white.
- Near-black ink with a restrained institutional green accent.
- Generous whitespace and long reading rhythms.
- Hairline rules used as structure, not decoration.
- No simulations, stock imagery, rendered hero objects, fake telemetry, ornamental HUD language, dashboards, cards, gradients, glass, or portfolio-agency effects.
- No fabricated metrics, quotations, awards, papers, or research claims.

## Typography
- Research titles and long-form statements: Iowan Old Style / Palatino / Georgia serif stack.
- Navigation and utility copy: Arial / Helvetica system sans.
- Metadata: system monospace, used sparingly.
- Display typography must never overlap adjacent content.

## Layout
- Maximum reading width of approximately 1180 px.
- Hero is spacious and text-first, occupying most of the first viewport without oversized agency typography.
- Publications are the first substantive section after the introduction.
- Research items and publications are full-width records with generous vertical separation rather than cards.
- Responsive layouts stack semantically instead of compressing desktop grids.

## Motion
No decorative motion. Native scrolling and link states only.

## Accessibility & resilience
- WCAG 2.2 AA contrast target.
- Semantic headings, sections, articles, and navigation.
- Visible keyboard focus.
- Essential content remains textual and does not depend on imagery, canvas, hover, or animation.
- Mobile typography and spacing preserve reading order and comfortable measure.

## Performance rules
- No runtime framework.
- No external font dependency.
- No WebGL or continuous render loop.
- Static HTML/CSS plus small data-loading JavaScript only.
- Keep publication and project content sourced from repository JSON so factual content remains independently maintainable.
