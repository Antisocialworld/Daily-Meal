# Daily Meal

A minimal consumer application for the
[APE-P-I](https://github.com/) food delivery API. Displays a
filterable, paginated list of restaurants fetched from the live API
across a real domain boundary — proving the API works from outside
its own codebase.

This is a genuinely separate project from APE-P-I, running on its
own port, making real cross-origin requests to the API.

## Live Deployment

Daily Meal is deployed and live:

- **App:** https://daily-meal-one.vercel.app
- **API it calls:** https://ape-p-i.vercel.app

The deployed app is a production build making real cross-origin
requests to the deployed APE-P-I API. `api-config.js` is committed
pointing at the production API URL, so the deployed app calls the
public URL, not localhost.

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

# Start the development server
npm run dev
```

The app runs at `http://localhost:3000` by default.

### API target for local development

`api-config.js` holds the single API base URL constant. As committed,
it points at the live, production API:

```javascript
export const API_BASE_URL = 'https://ape-p-i.vercel.app';
```

That means `npm run dev` works out of the box with no setup — the local
dev server fetches from the real, deployed API. To develop against a
local APE-P-I dev server instead, temporarily change that constant to
`http://localhost:3001`, then change it back. The brief explicitly
requires the consumer to call the public URL, not localhost, so the
committed default must stay on the production URL.

## API Target

The API base URL is a single constant in `api-config.js`, never
duplicated anywhere else:

```javascript
export const API_BASE_URL = 'https://ape-p-i.vercel.app';
```

This is the real, deployed APE-P-I URL. It was swapped from
`http://localhost:3001` to production after both this app and the API
were deployed to Vercel — first to an early preview URL, then to the
clean production domain above. The brief explicitly requires the
consumer to call the public URL, not localhost.

## Tech Stack

- Next.js 16 (App Router, React 19)
- No database, no backend logic — pure API client
- Cross-origin fetch to APE-P-I

## Color Palette

`#E4DDD3` (background) and `#00A19B` (accent) are the only two
colors used in the UI. The logo image is the sole exception.
