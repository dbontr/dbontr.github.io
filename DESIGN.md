# Design Contract — dbontr.github.io

## Concept
**Research Profile** — a personal academic website for a serious technical researcher. Publications, research, and technical interests carry the page; visual design exists to improve credibility, clarity, and reading rather than to perform for the visitor.

## Control dials
- Expression: 2/10
- Motion: 0/10
- Density: 3/10
- Interaction complexity: 1/10

## Hierarchy
1. Name, affiliation, and concise research statement.
2. Peer-reviewed publications.
3. Selected technical research and systems.
4. Biography, research focus, methods, and external profiles.

## Visual language
- Quiet off-white research-paper surface rather than decorative texture.
- Near-black text with a restrained desaturated blue accent.
- Generous whitespace and long reading rhythms.
- Hairline rules used only for information structure.
- No simulations, stock imagery, rendered hero objects, fake telemetry, ornamental HUD language, dashboards, cards, gradients, glass, or portfolio-agency effects.
- No fabricated metrics, quotations, awards, papers, or research claims.

## Typography
- Entire interface uses a neutral system sans-serif stack: ui-sans-serif / San Francisco / Segoe UI / Helvetica / Arial.
- Headings rely on weight, size, tracking, and whitespace rather than a decorative display face.
- Body text stays comfortably sized with generous line height.
- Monospace is not used as a generic signal for technical credibility.
- Display typography must never overlap adjacent content.

## Layout
- Maximum content width approximately 1240 px.
- Hero uses a spacious two-column research-profile composition: identity and research statement on the left, concise research metadata on the right.
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
