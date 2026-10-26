# Steven Figler, portfolio

The source for my personal portfolio at [stepupgaming.github.io](https://stepupgaming.github.io/).

It is a static site with no build step:

- `index.html` and `404.html`
- `styles.css`, self-hosted Archivo and JetBrains Mono
- `main.js`, for the video controls, mobile menu, scroll state, and scroll reveals
- `assets/`, including a real short render from `director`

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 5500
```

Then visit `http://127.0.0.1:5500/`.

## Publish

The repo is a GitHub user site, so GitHub Pages serves the root of `main`.

```bash
git add .
git commit -m "Update the portfolio"
git push
```

No Actions workflow is needed. The `.nojekyll` file keeps GitHub Pages from running Jekyll over the static files.
