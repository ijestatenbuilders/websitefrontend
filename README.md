# IJ Estate & Builders

React frontend for IJ Estate & Builders. Vite builds the production site into
`build/`; the build script also prerenders the primary routes for search and
social previews when the build environment allows Chromium to reach the local
preview server. If that local connection is refused, prerendering is skipped with
a warning and the SPA remains available through the host's route fallback.

## Requirements

- Node.js 22.12 or newer within the 22.x release line
- npm 8 or newer

## Available scripts

### `npm start`

Starts the Vite development server at `http://localhost:5173`.

### `npm test`

Runs the Vitest unit tests once.

### `npm run build`

Updates the sitemap when the backend is available, builds the production site,
and prerenders the primary routes into `build/`. If Chromium cannot connect to
the local preview server, the build keeps the SPA output and reports that route
snapshots were skipped.

### `npm run preview`

Serves the production build locally for verification.

## Deployment

Upload the contents of `build/` to the static website's document root. The build
contains the SPA fallback rules and, when prerendering succeeds, prerendered route
folders. Hostinger's Git deployment can build this project with `npm run build`
and output directory `build`.

The `.env.production` file can set public `REACT_APP_*` values used by the
frontend. Never put private credentials in client-side environment variables.
