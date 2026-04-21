# personal-website

A simplified single-page personal site inspired by [anthonymorris.dev](https://anthonymorris.dev/) with a lighter, slightly playful palette.

## Local run

This is a static site. Run a simple static server from the repo root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

- `index.html` - one-page portfolio layout
- `styles.css` - layout, typography, and color system
- `app.js` - post rendering plus optional local draft editor behavior
- `content/blog-posts.json` - published technical posts and notes

## Content model

`content/blog-posts.json` contains two arrays:

- `technical` for published technical writing
- `personal` for shorter notes

Each post should follow this shape:

```json
{
  "title": "Post title",
  "date": "2026-04-06",
  "summary": "One short description.",
  "url": "https://example.com/my-post-or-local-link",
  "tags": ["TagOne", "TagTwo"]
}
```

## Draft editor

The public homepage no longer opens any writing UI by default.

If you want to reveal the local draft editor controls, use either:

- `?compose=technical`
- `#compose-technical`

Compose mode only reveals the editor option. Drafts are saved to browser `localStorage` under `customTechnicalDrafts` until you move them into `content/blog-posts.json`.
