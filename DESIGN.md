# Design Contract — dbontr.github.io

## Concept
**Personal Researcher Site** — a small, multi-page academic website for an individual researcher. It should feel closer to a well-maintained faculty or research-scientist homepage than a portfolio, startup landing page, lab website, or design showcase.

## Reference principle
The site takes inspiration from the directness of simple academic personal sites such as `swutw.github.io`: identity first, straightforward navigation, restrained typography, personal context, and research content presented without visual theater. Do not copy another site's distinctive assets or text.

## Information architecture
1. `index.html` — Home: concise introduction plus a personal portrait.
2. `publications.html` — Publications.
3. `research.html` — Research themes and projects with scientific visuals.
4. `research-item.html?id=...` — JSON-driven research detail view.
5. `about.html` — Biography, portrait, education, experience, interests, tools, and profiles.
6. `contact.html` — Primary email, collaboration context, location, and external profiles.

The HTML files are intentionally thin page shells. Visible content is rendered from JSON by `assets/js/portfolio-content.js`.

## JSON content architecture
- `data/site.json` — shared navigation, site identity, page metadata, headings, home copy, and contact copy.
- `data/profile.json` — portrait, biography, education, experience, research focus, and skills.
- `data/publications.json` — papers, posters, awards, venues, and links.
- `data/projects.json` — research records, detail-page sections, visuals, related publications, and repositories.
- `data/links.json` — email and external profiles.

Ordinary content updates must not require editing HTML. Adding a publication, research record, profile link, experience entry, or changing page copy should be a JSON-only change.

## Control dials
- Expression: 2/10
- Motion: 0/10
- Density: 4/10
- Interaction complexity: 2/10

## Visual language
- White background.
- Neutral dark text and restrained muted blue links.
- Sans-serif typography throughout.
- Narrow, readable content width with generous but ordinary academic-site whitespace.
- Thin dividers only where they improve scanning.
- A personal portrait is appropriate on Home and About.
- Research visuals must explain the work: plots, diagrams, detector geometry, field/circuit sketches, or other project-specific graphics. They are not decorative stock images.
- No simulations, glossy renders, dashboards, gradients, glass, fake telemetry, numbered navigation, oversized slogans, or fabricated research graphics.
- No fabricated metrics, awards, publications, or claims.

## Research pattern
The Research page is not a repository directory. It is a topical research index. Each entry has a concise scientific visual, summary, and a detail view. The detail view can contain an overview, methods, research questions, related publications, and repositories when available. Call these research items, projects, areas, or work — not articles.

## Typography
- Native system sans-serif stack: San Francisco / Segoe UI / Helvetica / Arial.
- Name is prominent but normal for an academic homepage.
- Page titles are modest and functional.
- Publication and research titles use moderate semibold weights.
- Body copy is 13–17px with comfortable line height.

## Layout
- Maximum content width approximately 1040px.
- Home stays simple and does not contain an Explore/directory section.
- Research uses a restrained two-column visual index on wider screens and one column on narrow screens.
- About pairs a portrait with substantive profile sections.
- Contact uses its available page space rather than presenting only a short list of links.
- Responsive layouts stack naturally; the top navigation wraps instead of adding unnecessary UI.

## Motion
No decorative motion. Native link and scroll behavior only.

## Accessibility & resilience
- WCAG 2.2 AA contrast target.
- Semantic headings, articles, sections, and navigation.
- `aria-current="page"` identifies the active page.
- Visible keyboard focus.
- Research visuals are supplemental; essential meaning remains in text.
- Mobile typography and spacing preserve reading order and comfortable measure.

## Performance rules
- No runtime framework.
- No external font dependency.
- No WebGL or continuous render loop.
- SVG research graphics where possible.
- Small HTML shells + CSS + one JSON-rendering JavaScript file.
