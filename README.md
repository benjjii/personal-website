# personal-website

A strict, minimalist single-page personal site inspired by anthonymorris.dev:

- **Default mode:** dark, text-first portfolio layout with all links on one page.
- **Notebook background:** faint grid lines in both dark and Anthropic modes.
- **Hidden mode:** a subtle bottom toggle switches to an Anthropic-inspired light palette and reveals the personal blog section.

## Local run

This is a static site. Run any simple static server from the repo root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

- `index.html` - single-page structure and sections
- `styles.css` - strict typography/layout styling and Anthropic-mode palette
- `app.js` - JSON post rendering, hidden mode toggle behavior, and locked technical blog editor flow
- `content/blog-posts.json` - editable technical + personal blog data

## Add your own blog posts

Edit `content/blog-posts.json` and add entries to either:

- `technical` for technical posts shown in the default portfolio view (currently starts empty)
- `personal` for posts shown in hidden Anthropic mode

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

Notes:

- Use ISO dates (`YYYY-MM-DD`) for sorting.
- Use `#` for `url` if a post is not published yet.

## Hidden toggle behavior

- At the bottom of the page there is a small, minimal button.
- Clicking it toggles **Anthropic mode** (light palette) and reveals/hides the personal blog section.

## Locked technical blog editor

- The **Technical Blog** heading has a lock button.
- Clicking it prompts for a password.
- Password: `benislucky`
- After the correct password, a modal opens where you can enter:
  - `Title`
  - `Body`
- Publishing adds a new technical post immediately on the page.
- New technical posts are saved in your browser `localStorage` (key: `customTechnicalPosts`).
