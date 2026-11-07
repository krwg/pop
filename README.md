# PILLARS OF PIXELS

Visual game launcher (Warm Ember). Catalog, library, settings, and web runtimes — including **2048**.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Production builds use base path `/pop/` for GitHub Pages.

## GitHub Pages

Site URL: https://krwg.github.io/pop/

On every push to `main`, CI builds the Vite app and publishes the `dist` output to the **`gh-pages`** branch.

**Required once** in the repo settings:

1. Open **Settings → Pages**
2. **Build and deployment → Source**: Deploy from a branch
3. Branch: **`gh-pages`** / **`/(root)`**
4. Save

Do **not** deploy from `main` root — that serves the Vite source `index.html` and shows a blank page.
