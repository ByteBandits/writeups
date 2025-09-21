# writeups

Writeups for CTFs by the team [ByteBandits](https://ctftime.org/team/13691)

All writeups are organized in the pattern:

ctf-name > problem-type > problem-name > author

That is, very similar to that of the repo [writeups](https://github.com/ctfs/write-ups-2015)

The repository also includes a small [search tool](search.py), through we can we can easily find writeups based on several conditions. Currently it just provides limited functionality and a crude command line interface.

## Frontend quick start

The repository now ships with a React-based frontend (inside [`ui/`](ui/)) that indexes the markdown writeups and exposes global fuzzy search, a CTF directory minimap, and rich previews.

1. (Recommended) Create a virtual environment in the repository root and install the generator dependency:

   ```bash
   python -m venv .venv
   source .venv/bin/activate            # On Windows use: .\.venv\Scripts\activate
   python -m pip install --upgrade pip
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

The generator writes `ui/public/writeups.json` and copies the markdown/attachment assets into `ui/public/writeups/` so they are available to the static site. The npm scripts automatically look for `PYTHON`, the active `VIRTUAL_ENV`, or a local `.venv` folder, so as long as you activate the environment (or create `.venv` in the repo root) the correct interpreter will be used without editing any paths.

The UI mirrors the feel of [cp-algorithms](https://cp-algorithms.com/):

* A single search box instantly scans titles, metadata, and markdown content.
* Results show the context of the best match (with highlighting) and default to listing every writeup.
* A collapsible directory in the sidebar lets you jump across CTFs and categories without filtering menus.

> **Note:** The frontend uses `BrowserRouter`. When hosting on GitHub Pages ensure that the `base` option in [`ui/vite.config.js`](ui/vite.config.js) matches the deployment path (default `/writeups/`). If direct deep-links return 404s on GitHub Pages, enable the 404.html redirect or switch to `HashRouter`.

## Adding new writeups

Each writeup should follow the structure:

```
writeups/<ctf-name>/<category>/<problem>.md
writeups/<ctf-name>/<category>/<problem>_files/ (optional attachments)
```

Every markdown file should start with lightweight metadata markers (legacy frontmatter is still supported for backwards compatibility):

```
[](ctf=utctf-2020)
[](type=pwn)
[](problem=buffer-overflow)
[](author=bytebandits)
[](points=100)
[](difficulty=medium)
[](tags=buffer-overflow,rop)
[](tools=gdb,python)
[](techniques=ret2libc)
[](files=challenge_files/exploit.py,challenge_files/notes.txt)
```

Values are comma separated where lists are expected. Additional keys such as `date` are also supported. The generator merges these markers with any YAML frontmatter present and falls back to the directory structure for missing fields.

After adding or updating writeups, rerun `npm run generate` (or `npm run dev` / `npm run build`) so that the search index includes the new content.
