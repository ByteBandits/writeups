# writeups

Writeups for CTFs by the team [ByteBandits](https://ctftime.org/team/13691)

All writeups are organized in the pattern:

ctf-name > problem-type > problem-name > author

That is, very similar to that of the repo [writeups](https://github.com/ctfs/write-ups-2015)

The repository also includes a small [search tool](search.py), through we can we can easily find writeups based on several conditions. Currently it just provides limited functionality and a crude command line interface.

## Frontend quick start

The repository now ships with a React-based frontend (inside [`ui/`](ui/)) that indexes the markdown writeups and exposes search, filtering and rich previews.

1. Install the generator dependency:

   ```bash
   python -m pip install python-frontmatter
   ```

2. Install the UI dependencies:

   ```bash
   cd ui
   npm ci
   ```

3. Start the local development server (this automatically regenerates the index):

   ```bash
   npm run dev
   ```

4. Build the production bundle:

   ```bash
   npm run build
   ```

The generator writes `ui/public/writeups.json` and copies the markdown/attachment assets into `ui/public/writeups/` so they are available to the static site.

> **Note:** The frontend uses `BrowserRouter`. When hosting on GitHub Pages ensure that the `base` option in [`ui/vite.config.js`](ui/vite.config.js) matches the deployment path (default `/writeups/`). If direct deep-links return 404s on GitHub Pages, enable the 404.html redirect or switch to `HashRouter`.

## Adding new writeups

Each writeup should follow the structure:

```
writeups/<ctf-name>/<category>/<problem>.md
writeups/<ctf-name>/<category>/<problem>_files/ (optional attachments)
```

Every markdown file should start with YAML frontmatter describing the entry:

```yaml
---
ctf: SampleCTF 2025
category: web
problem: helloworld
author: your-name
points: 100
difficulty: easy
tags: [xss, challenge]
date: 2025-09-21
---
```

After adding or updating writeups, rerun `npm run generate` (or `npm run dev` / `npm run build`) so that the search index includes the new content.
