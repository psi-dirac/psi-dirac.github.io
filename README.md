# PSI Group website

Website for the **Planet–Star Interaction (PSI) Group**, DiRAC Institute, University of Washington.
Static HTML/CSS/JS — no build step, no dependencies. Served by GitHub Pages.

```
index.html          Home — animated dipper light curve hero
about.html          About the group (placeholder copy)
research.html       Research themes (placeholder copy)
team.html           Team — rendered from assets/data/team.json
resources.html      Resources — searchable, sortable table from assets/data/resources.json
leadership.html     Redirect to team.html (keeps old links alive)
assets/css/psi.css  All styling
assets/js/          site.js (nav + reveals), team.js, resources.js
assets/data/        team.json, resources.json  ← the two files you actually edit
assets/img/team/    portraits
```

## Preview locally

The Team and Resources pages read JSON with `fetch()`, which browsers block on `file://`.
Serve the folder instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`.
`.nojekyll` is included so nothing gets reprocessed.

## Add a team member

Add one object to `assets/data/team.json`:

```json
{
  "name": "Ada Lovelace",
  "role": "PhD Student, Astronomy",
  "group": "Graduate Students",
  "focus": "Mid-infrared variability of young stars",
  "photo": "assets/img/team/ada-lovelace.jpg",
  "pronouns": "she/her",
  "bio": "Two or three sentences. Shown when someone selects the card.",
  "links": { "Email": "mailto:ada@uw.edu", "ADS": "https://...", "GitHub": "https://..." }
}
```

- `group` controls which section the person appears in. Sections render in this order:
  Leadership → Postdoctoral Researchers → Graduate Students → Undergraduate Researchers →
  Affiliates → Alumni. Any other value gets its own section at the end.
- `photo` is optional. Leave it `""` or point at a file that does not exist yet and the card
  shows a monogram tile instead — no broken images.
- Portraits: square-ish or slightly tall, **at least 600 × 750 px**, cropped head-and-shoulders.
  They are displayed at 4:5 and desaturated slightly until hovered.
- `links` keys become the button labels, so use short words.

## Add a resource

Add one object to `assets/data/resources.json`:

```json
{
  "name": "Some archive",
  "category": "Surveys & archives",
  "type": "Photometry",
  "access": "Public",
  "maintainer": "Who runs it",
  "updated": "2026-08",
  "url": "https://example.org",
  "description": "One line on why the group uses it.",
  "tags": ["searchable", "keywords"]
}
```

- Filter chips are generated from the `category` values, so reuse existing spellings
  (`Surveys & archives`, `Software`, `Observing`, `Computing`, `Reading & writing`, `Onboarding`)
  or invent a new one and a chip appears automatically.
- `access` starting with "Public" or "Open" renders an orange tag; anything else renders as
  restricted. `Group only`, `Login required`, and `UW account` are already in use.
- `tags` never display — they only widen what the search box matches.
- `updated` sorts as text, so keep the `YYYY-MM` format.
- Empty `url` renders a dash instead of a link.

## Placeholders to replace

- `about.html` and `research.html` — placeholder copy throughout, marked with a red rule.
- Home page **Group log** — three placeholder entries in `index.html`.
- `assets/data/team.json` — "PI Name", "Co-Investigator Name", and the student stubs.
- `psi-group@uw.edu` — appears in the footer of every page and in several data entries.
- Resource `updated` dates are illustrative; correct them as you go.

## Design notes

- Palette: `--ink #0B0A0C`, `--ember #FF6B1A`, `--rust #A33220`, `--bone #F7F4F2`, `--ash #A79B98`
  — all defined at the top of `psi.css`.
- Type: Bricolage Grotesque (display), IBM Plex Sans (body), IBM Plex Mono (labels, data, dates).
- The hero light curve is inline SVG. Its path is a synthetic dipper light curve; the shaded band
  marks the deepest event. On screens under 700px `site.js` swaps the `viewBox` to crop into that
  dip rather than letting the whole baseline shrink to a hairline.
- `prefers-reduced-motion` disables the line-drawing animation and scroll reveals.
