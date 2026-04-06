# personal-website

A minimalist personal website + blog with two modes:

- **Portfolio mode (dark):** landing page with projects, technical writing, interests, and contact.
- **Personal blog mode (light + upside down):** unlocked at the bottom of the page via a "Flip the page" button.

## Local run

This is a static site. Run any simple static server from the repo root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

- `index.html` - page structure and sections
- `styles.css` - visual design and page flip animation
- `app.js` - blog rendering and flip behavior
- `content/blog-posts.json` - editable technical + personal blog data

## Add your own blog posts

Edit `content/blog-posts.json` and add entries to either:

- `technical` for technical posts shown on the portfolio side
- `personal` for posts shown on the flipped personal-blog side

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
