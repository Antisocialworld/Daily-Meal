# Daily Meal

A minimal consumer application for the
[APE-P-I](https://github.com/) food delivery API. Displays a
filterable, paginated list of restaurants fetched from the live API
across a real domain boundary — proving the API works from outside
its own codebase.

This is a genuinely separate project from APE-P-I, running on its
own port, making real cross-origin requests to the API.

## What It Does

- Lists restaurants from the live APE-P-I API
- Filters by cuisine (case-insensitive, partial match)
- Paginates with Previous/Next controls using real offset/limit
- Handles three states: loading, empty (no results), and error

## Logo

The wordmark logo at the top of the page (`public/logo.png`) is a
scoped exception to the two-color rule. It contains black accents
(bowl mark, underline) and a brighter teal (`#00C8BE`) in the
wordmark, distinct from the app's standard `#00A19B` used
everywhere else in the UI. These colors appear only within the logo
image itself.

## Quick Start

```bash
# Install dependencies
npm install

# Set the API base URL (edit api-config.js)
# Currently defaults to http://localhost:3001

# Start the development server
npm run dev
```

The app runs at `http://localhost:3000` by default.

## API Target

The API base URL is a single constant in `api-config.js`:

```javascript
export const API_BASE_URL = 'http://localhost:3001';
```

This currently points at the local APE-P-I dev server. Once both
projects are deployed to Vercel, swap this to the real, deployed
API URL. The brief explicitly requires the consumer to call the
public URL, not localhost.

## Tech Stack

- Next.js 16 (App Router, React 19)
- No database, no backend logic — pure API client
- Cross-origin fetch to APE-P-I

## Color Palette

`#E4DDD3` (background) and `#00A19B` (accent) are the only two
colors used in the UI. The logo image is the sole exception.
