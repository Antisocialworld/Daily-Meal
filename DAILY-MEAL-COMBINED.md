# DAILY-MEAL-COMBINED — PRD + AGENT_RULES + SKILL

## Task
The consumer application half of Task 1 (Build and Serve a
Consumable API) from the Five Engineering Tasks brief. A separate,
standalone project from the API itself (APE-P-I), calling it across
a real domain boundary to prove the API works from outside its own
codebase.

---

## PART 1 — PRD

### What This Is
Daily Meal, a small, minimal client application that calls the
live APE-P-I food delivery API and displays the result. This is
the "smallest possible client" the brief requires, not a full
consumer product.

### What This Is Not
No authentication of its own. No ordering, checkout, or payment
flow, this app only displays data, it doesn't place real orders. No
landing page beyond the single functional page itself. No admin
panel, no user accounts.

### Required Features (exactly these, per the brief)
- A list of restaurants, fetched from the live API.
- A filter control (at minimum, filter by cuisine).
- A "next page" button, using the API's real offset/limit
  pagination.

Viewing a single restaurant's menu (`GET /api/v1/restaurants/:id/menu`)
is explicitly OUT of scope for this minimal client. The brief only
requires "a list, a filter control, and a next page button," adding
a detail view would be real, avoidable scope creep beyond "the
smallest possible client."

### API Target
The API base URL is a single, easily-changeable constant, never
hardcoded in more than one place. It points at the live, deployed,
production APE-P-I API: `https://ape-p-i.vercel.app` (`api-config.js`).
The brief explicitly requires "The consumer must call the public URL,
not localhost" — the deployed app does. For local development against an
APE-P-I dev server running on this machine, the constant can be
temporarily set to `http://localhost:3001` and must be swapped back
before any deployment.

### Required States (per the brief's "Excellent" grading band)
Every fetch from the API must visibly handle three states, not just
the happy path:
- **Loading** — a real, visible indicator while the request is in
  flight.
- **Empty** — if a filter genuinely matches zero restaurants, a real
  "no results found" message, never a blank area.
- **Error** — if the fetch itself fails (network error, non-200
  response, CORS failure), a real, visible error message, never a
  silent failure or an unhandled console error.

### Color Palette
`#E4DDD3` and `#00A19B` are the only two colors used anywhere this
app needs color: backgrounds, buttons, accents, active/hover states.
No third color, no framework default, no unstyled browser default
left showing.

**Logo exception (scoped):** The logo image (`public/logo.png`)
contains black accents (the bowl-and-steam mark, the underline) and
a brighter teal (`#00C8BE`) in the "Daily Meal" wordmark, distinct
from the app's standard `#00A19B`. These colors appear only within
the logo asset itself and are not introduced anywhere else in the
UI.

### Evidence Required (from the brief)
A screenshot of this app displaying real data fetched from the live,
deployed API. The app is live at `https://daily-meal-one.vercel.app`
(calling the production API), so a plain screenshot of the running,
deployed app satisfies this — no localhost involved.

---

## PART 2 — AGENT_RULES

### Git
Never commit/stage/push without explicit authorization. Read-only
git commands are always fine. Commit messages describe what changed,
never "update" or "fix."

### Scope discipline
Build only the three required features listed above. Treat "What
This Is Not" as a hard boundary. This app never needs its own
database, its own authentication, or its own backend logic, it is a
pure client of the API.

### Cross-origin awareness
This app runs as a genuinely separate project from the API, on a
different port/domain. Every fetch to the API is a cross-origin
request. If a fetch fails with a CORS-related error in the browser
console, the fix belongs on the API side (APE-P-I's own CORS
headers), never by adding a proxy or workaround on this side that
would break once both are deployed to their real, separate domains.

### Color palette enforcement
`#E4DDD3` and `#00A19B` are the only two colors permitted anywhere
in this app's UI. Check every new component against this before
introducing any color value.

### Naming
This folder is named `daily-meal` (or `Daily-meal`), lowercase,
hyphenated, no capital letters, learned directly from the real
npm/create-next-app naming failure documented in APE-P-I's own
DOCUMENTATION.md Section 6. Never rename this folder to something
with capitals without checking npm's naming rules first.

### Evidence
The "Evidence Required" screenshot needs an actual screenshot of
real, live data, never a description of expected behavior presented
as if confirmed.

### Sequencing
Build against the API's real, running localhost URL first (already
confirmed working). Swap the base URL to the real, deployed API URL
only after both this app and the API are live on Vercel. Do not
swap the URL prematurely, since a live URL that doesn't exist yet
would break the app for no reason. This is now complete: both are
live on Vercel and `api-config.js` points at the production URL
(`https://ape-p-i.vercel.app`).

---

## PART 3 — SKILL (technical how-to)

### The single, changeable API base URL
```javascript
// api-config.js
// Points at the live, deployed, production APE-P-I API. For local
// development against an API running on this machine, temporarily
// change this to http://localhost:3001, then swap it back.
export const API_BASE_URL = 'https://ape-p-i.vercel.app';
```
Every fetch call imports and uses this constant, never a hardcoded
URL string repeated in multiple files.

### Handling the three required states, in one component
```javascript
const [cuisine, setCuisine] = useState('');
const [offset, setOffset] = useState(0);
const LIMIT = 20;

const [state, setState] = useState({ status: 'loading', data: null, error: null });

useEffect(() => {
  setState({ status: 'loading', data: null, error: null });
  const params = new URLSearchParams({ limit: LIMIT, offset, ...(cuisine && { cuisine }) });
  fetch(`${API_BASE_URL}/api/v1/restaurants?${params}`)
    .then(res => {
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    })
    .then(json => {
      const results = json?.data ?? [];
      setState({ status: results.length === 0 ? 'empty' : 'success', data: json, error: null });
    })
    .catch(err => setState({ status: 'error', data: null, error: err.message }));
}, [cuisine, offset]);

// "Next page" button: setOffset(offset + LIMIT), and disable/hide the
// button when state.data?.meta?.hasMore is false, using the API's own
// hasMore field, not a client-side guess.

// Render:
// status === 'loading' -> loading indicator
// status === 'empty'   -> "No results found"
// status === 'error'   -> real, visible error message (state.error)
// status === 'success' -> the actual restaurant list
```

### Diagnosing a CORS failure, if one occurs
A CORS failure shows up specifically in the browser console (not as
a normal fetch .catch(), the request is blocked before a response
is even received), something like: "Access to fetch at
'http://localhost:3001/...' from origin 'http://localhost:XXXX' has
been blocked by CORS policy." If this happens, the fix is on
APE-P-I's side (its CORS headers), not here. Confirm via the
browser's Network tab whether the request shows as "blocked"
(CORS) versus a real HTTP error status (a genuine API problem).

### Recognizing a real 429 from the API
This app does not need its own rate limiting, it's the client, not
the server being protected. But it may genuinely receive a real 429
from APE-P-I during testing (its own rate limit is 100 requests per
minute). The generic `Request failed: ${res.status}` error message
in the state-handling example above already surfaces this correctly
as a real, visible error, worth checking res.status === 429
specifically and showing a clearer message like "Too many requests,
please wait a moment" rather than a generic failure, since this is
an expected, recoverable condition, not a real bug.

### Color palette application
```css
:root {
  --color-background: #E4DDD3;
  --color-accent: #00A19B;
}
```
Use these two CSS variables everywhere color is needed, rather than
repeating the raw hex values across components.
