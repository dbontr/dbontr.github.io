# Design Contract — dbontr.github.io

## Concept
**Personal Researcher Site** — a small, multi-page academic website for an individual researcher. It should feel closer to a well-maintained faculty or research-scientist homepage than a portfolio, startup landing page, lab website, or design showcase.

## Reference principle
The site takes inspiration from the directness of simple academic personal sites such as `swutw.github.io`: identity first, straightforward navigation, restrained typography, and research content presented without visual theater. Do not copy another site's distinctive assets or text; preserve only the simplicity and information-first approach.

## Information architecture
Five small pages:
1. `index.html` — Home.
2. `publications.html` — Publications.
3. `research.html` — Research.
4. `about.html` — About.
5. `contact.html` — Contact.

The HTML files are intentionally thin page shells. Visible content is rendered from JSON by `assets/js/portfolio-content.js`.

## JSON content architecture
- `data/site.json` — shared navigation, site identity, page metadata, page headings, home copy, and home directory links.
- `data/profile.json` — biography, research focus, and skills used by About.
- `data/publications.json` — publication, paper, poster, award, venue, and link records used by Publications.
- `data/projects.json` — research and technical project records used by Research.
- `data/links.json` — email and external profiles used by About and Contact.
- `data/README.md` — editing guide and example record formats.

Ordinary content updates must not require editing HTML. Adding a publication, research project, profile link, or changing page copy should be a JSON-only change.

The same small top navigation appears on every page and is generated from `data/site.json`. Do not use a sidebar; this is a personal site, not a research group or documentation portal.

## Control dials
- Expression: 1/10
- Motion: 0/10
- Density: 4/10
- Interaction complexity: 1/10

## Visual language
- White background.
- Neutral dark text and restrained muted blue links.
- Sans-serif typography throughout.
- Narrow, readable content column with generous but ordinary academic-site whitespace.
- Thin dividers only where they improve scanning.
- No simulations, rendered objects, stock imagery, decorative photos, dashboards, cards, gradients, glass, fake telemetry, coordinates, numbered navigation, oversized slogans, or decorative research graphics.
- No fabricated metrics, awards, quotes, publications, or claims.

## Typography
- Native system sans-serif stack: San Francisco / Segoe UI / Helvetica / Arial.
- Name is prominent but normal for an academic homepage, not an agency hero.
- Page titles are modest and functional.
- Publication and research titles use moderate semibold weights.
- Body copy is 14–16px with comfortable line height.
- Monospace is not used as a visual shorthand for technical credibility.

## Layout
- Maximum content width approximately 980px.
- Home introduces the person but does not duplicate all site content.
- Publications and research each have dedicated pages.
- About and Contact each have dedicated pages rather than being buried at the bottom of a long homepage.
- Responsive layouts stack naturally; the top navigation wraps on narrow screens rather than introducing unnecessary UI.

## Motion
No decorative motion. Native link and scroll behavior only.

## Accessibility & resilience
- WCAG 2.2 AA contrast target.
- Semantic headings, articles, sections, and navigation.
- `aria-current="page"` identifies the active page in the shared navigation.
- Visible keyboard focus.
- Essential content is textual and does not depend on imagery, hover, or animation.
- Mobile typography and spacing preserve reading order and comfortable measure.

## Performance rules
- No runtime framework.
- No external font dependency.
- No WebGL or continuous render loop.
- Small HTML shells + CSS + one JSON-rendering JavaScript file.
- Keep content structured and maintainable in JSON so factual updates remain independent from page layout and styling.
