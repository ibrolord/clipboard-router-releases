# Clipboard Router website

The public launch site for Clipboard Router, built as a React/Vite single-page
application deployed through GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run build:pages
npm audit --omit=dev
```

`build:pages` writes a privacy-reviewed artifact to `dist/pages`. It publishes
only explicitly allowlisted public rasters: the app artwork, the social card,
and the fictional product illustration icon. It never publishes source captures
or historical marketing images. Pushes to `main` deploy that artifact through
`.github/workflows/pages.yml` in the parent release repository.

Product and release facts should remain aligned with the parent release
repository's `README.md`, `PRIVACY.md`, and published GitHub release assets.
