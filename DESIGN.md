# Design Contract — dbontr.github.io

## Concept
**Personal Researcher Site** — a simple one-page academic website for an individual researcher. It should feel closer to a well-maintained faculty or research-scientist homepage than a portfolio, startup landing page, lab website, or design showcase.

## Reference principle
The site takes inspiration from the directness of simple academic personal pages such as `swutw.github.io`: identity first, a short research introduction, straightforward navigation, and research content immediately available. Do not copy another site's distinctive assets or text; preserve only the simplicity and information-first approach.

## Control dials
- Expression: 1/10
- Motion: 0/10
- Density: 4/10
- Interaction complexity: 1/10

## Hierarchy
1. Name, affiliation, and a short explanation of research interests.
2. Publications.
3. Selected research and technical work.
4. About, methods, and profile links.

## Visual language
- White background.
- Neutral dark text and restrained muted blue links.
- Sans-serif typography throughout.
- No side navigation; this is a personal site, not a research group or documentation portal.
- Small top navigation with section anchors only.
- Narrow, readable content column with generous but not theatrical whitespace.
- Thin dividers used only to separate records and major sections.
- No simulations, rendered objects, stock imagery, decorative photos, dashboards, cards, gradients, glass, fake telemetry, coordinates, numbered navigation, oversized slogans, or decorative research graphics.
- No fabricated metrics, awards, quotes, publications, or claims.

## Typography
- Native system sans-serif stack: San Francisco / Segoe UI / Helvetica / Arial.
- Name is prominent but normal for an academic homepage, not an agency hero.
- Publication and research titles use moderate semibold weights.
- Body copy is 14–16px with comfortable line height.
- Monospace is not used as a visual shorthand for technical credibility.

## Layout
- One page with top anchors: Publications, Research, About, plus GitHub as an external link.
- Maximum content width approximately 980px.
- Intro occupies only as much space as needed to establish identity and research direction.
- Publications are compact citation-style rows.
- Research items are text records, not cards.
- About is a simple text section with research focus, tools, and external links.
- Mobile stacks naturally without introducing a hamburger menu unless the navigation materially grows.

## Motion
No decorative motion. Native scrolling and link states only.

## Accessibility & resilience
- WCAG 2.2 AA contrast target.
- Semantic headings, sections, articles, and navigation.
- Visible keyboard focus.
- Essential content is textual and does not depend on imagery, hover, or animation.
- Mobile typography and spacing preserve reading order and comfortable measure.

## Performance rules
- No runtime framework.
- No external font dependency.
- No WebGL or continuous render loop.
- Static HTML/CSS plus small JSON-loading JavaScript only.
- Keep publication and project content sourced from repository JSON so factual content remains independently maintainable.
