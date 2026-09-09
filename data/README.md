# Site content

All visible site content is loaded from JSON. The HTML files are lightweight page shells.

## Files

- `site.json` — global navigation, page titles/descriptions, home copy, section labels, and contact copy.
- `profile.json` — portrait, biography, education, research experience, interests, and skills.
- `publications.json` — publications, papers, posters, awards, and publication links.
- `projects.json` — research index entries plus the content for each research detail page.
- `links.json` — email and external profiles used by About and Contact.

## Add a publication

Add a new object near the top of `publications.json`:

```json
{
  "id": "2027-short-unique-id",
  "title": "Publication title",
  "authors": "Author One, Devon Bontrager, Author Three",
  "type": "Journal article",
  "venue": "Journal or conference",
  "year": 2027,
  "date": "March 2027",
  "location": "Optional location",
  "award": "Optional award",
  "tags": ["Quantum Computing", "PDE"],
  "links": { "doi": "https://doi.org/..." }
}
```

Use `links.url` instead of `links.doi` for a normal web page, poster, or PDF. Optional fields can simply be omitted.

## Add a research item

Every object in `projects.json` appears on `research.html` and automatically gets a detail view at `research-item.html?id=<id>`.

```json
{
  "id": "short-unique-id",
  "title": "Research title",
  "subtitle": "One-line technical description",
  "year": "2026–2027",
  "category": "Quantum computing",
  "summary": "Short research-page summary.",
  "visual": "assets/images/research/project-output.png",
  "visualAlt": "Describe the real output shown in the image.",
  "visualCaption": "Optional short provenance/caption for the project output.",
  "tags": ["Quantum Computing", "Scientific Computing"],
  "overview": [
    "First overview paragraph.",
    "Second overview paragraph."
  ],
  "sections": [
    {
      "heading": "Methods",
      "paragraphs": ["Optional explanatory paragraph."],
      "items": ["Method one", "Method two"]
    }
  ],
  "relatedPublications": ["publication-id-from-publications-json"],
  "links": {
    "code": "https://github.com/...",
    "Benchmark repository": "https://github.com/..."
  }
}
```

`visual`, `visualAlt`, and `visualCaption` are optional. Research visuals must be genuine public/project-approved artifacts from the work itself, such as plots, benchmark outputs, screenshots, or figures. Never add confidential, embargoed, internal-only, or otherwise non-public material. If no approved public visual exists, omit the visual rather than creating a decorative substitute.

## Change the home page or page copy

Edit `site.json`. The Home page intentionally has no Explore/directory block; primary navigation lives in the shared header.

## Change portrait, biography, education, or research experience

Edit `profile.json`. `portrait` may be a local asset path or an HTTPS image URL.

## Change contact/profile links

Edit `links.json`. Each item can include `label`, `url`, and an optional short `detail` string.

No HTML editing is required for ordinary content updates.
