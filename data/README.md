# Site content

All visible site content is loaded from JSON. The HTML files are only lightweight page shells.

## Files

- `site.json` — global navigation, page titles/descriptions, home-page copy, section labels, and directory links.
- `profile.json` — biography, research focus, skills, and profile details used by the About page.
- `publications.json` — every publication, paper, poster, award, and publication link shown on the Publications page.
- `projects.json` — research and technical projects shown on the Research page.
- `links.json` — email and external profiles used by the About and Contact pages.

## Add a publication

Add a new object near the top of `publications.json`:

```json
{
  "id": "2026-short-unique-id",
  "title": "Publication title",
  "authors": "Author One, Devon Bontrager, Author Three",
  "type": "Journal article",
  "venue": "Journal or conference",
  "year": 2026,
  "date": "September 2026",
  "location": "Optional location",
  "award": "Optional award",
  "tags": ["Quantum Computing", "PDE"],
  "links": {
    "doi": "https://doi.org/..."
  }
}
```

Use `links.url` instead of `links.doi` when the record has a normal web page or poster/PDF link rather than a DOI. `location`, `award`, `tags`, and links are optional.

## Add a research project

Add an object to `projects.json`:

```json
{
  "title": "Project name",
  "subtitle": "Short technical description",
  "year": 2026,
  "summary": "What the project does and why it matters.",
  "tags": ["HPC", "Physics"],
  "links": {
    "code": "https://github.com/..."
  }
}
```

## Change navigation or page copy

Edit `site.json`. Each page has its own entry under `pages`, and the top navigation is controlled by `site.navigation`.

## Change biography or contact links

Edit `profile.json` or `links.json`. No HTML changes are required for ordinary content updates.
