# Daily Meal — Documentation

This file follows the same 8-section pattern used for APE-P-I and
the Four Build Assessments, split out so the README can stay short.

---

## 1. What This Is

Daily Meal is a minimal consumer application that calls the live
APE-P-I food delivery API and displays the result. It is the
"smallest possible client" the Five Engineering Tasks brief requires:
a list, a filter control, and a next page button. Nothing more.

It is not a full consumer product. There is no authentication of its
own. There is no ordering, checkout, or payment flow. There is no
restaurant detail view, no map integration, no user accounts. It
displays data from the API and handles three states (loading, empty,
error). That is the entire scope.

The project is genuinely separate from APE-P-I. It runs on its own
port (`localhost:3000`), in its own folder, with its own `package.json`.
Every fetch to the API is a real cross-origin request, not a same-origin
call or a server-side proxy. This separation is deliberate — it proves
the API works from outside its own codebase.

The app is deployed and live at `https://daily-meal-one.vercel.app`,
calling the production APE-P-I API at `https://ape-p-i.vercel.app`
across the real, deployed domain boundary.

The stack is Next.js 16 (App Router) with React 19. There is no
database, no backend logic, no server-side data fetching. This is a
pure client application.

---

## 2. How To Run It

### Prerequisites
- Node.js 18+
- No running API required. `api-config.js` as committed points at the
  live, production APE-P-I API (`https://ape-p-i.vercel.app`), so
  `npm run dev` fetches real data immediately. To develop against a
  local APE-P-I dev server instead, run it on `localhost:3001` and
  temporarily point the constant there.

### Commands

```bash
# Install dependencies
npm install

# Start the development server (port 3000)
npm run dev
```

The app is available at `http://localhost:3000`.

The deployed version of the app is live at
`https://daily-meal-one.vercel.app`, calling the production API at
`https://ape-p-i.vercel.app`.

### Configuration

The API base URL lives in a single file, `api-config.js`:

```javascript
export const API_BASE_URL = 'https://ape-p-i.vercel.app';
```

This is the only place the URL is set. Every fetch call imports
this constant. As committed it points at the live, production APE-P-I
API, and the deployed app calls this public URL — exactly what the
brief requires ("The consumer must call the public URL, not
localhost"). For local development against a local APE-P-I dev server,
temporarily set it to `http://localhost:3001`, then swap it back
before deploying.

---

## 3. The Flow, Step By Step

### Page load

1. **React renders the initial state.** `Home()` in `app/page.js`
   initializes `state` to `{ status: 'loading', data: null, error: null }`.
   The UI immediately shows "Loading restaurants..." in teal.

2. **useEffect fires.** With `cuisine` empty and `offset` at 0, the
   effect builds the URL: `/api/v1/restaurants?limit=20&offset=0`.

3. **Cross-origin fetch.** The request goes to
   `http://localhost:3001/api/v1/restaurants?limit=20&offset=0` in
   local development (the deployed app sends the same request to
   `https://ape-p-i.vercel.app` instead). This is a real cross-origin
   request — the browser enforces CORS, and APE-P-I responds with
   `Access-Control-Allow-Origin: *`.

4. **Response handling.**
   - If the response is 429: throws `"Too many requests, please wait a moment"`
   - If not `res.ok`: throws `"Request failed: ${status}"`
   - Otherwise: parses JSON, extracts `json.data`, sets status to
     `'success'` (or `'empty'` if the array is empty)

5. **Render.** The restaurant list renders as `<li>` elements, each
   with a teal left border, the restaurant name, cuisine, and
   address. Below the list: Previous and Next buttons.

### Filtering by cuisine

1. User types in the filter input (e.g. "italian").
2. `handleCuisineChange` sets `cuisine` state and resets `offset` to 0.
3. `useEffect` re-fires with the new cuisine value, building:
   `/api/v1/restaurants?limit=20&offset=0&cuisine=italian`.
4. The API's Prisma query uses `{ contains: value, mode: "insensitive" }`
   — so "italian" matches "Italian" in the database.
5. Results update. If zero matches: "No results found" message.

### Pagination

1. **Next page:** `handleNextPage` increments offset by `LIMIT` (20).
   `useEffect` re-fires with the new offset. The button is disabled
   when `state.data?.meta?.hasMore` is false.
2. **Previous page:** `handlePrevPage` decrements offset by `LIMIT`,
   floored at 0. The button is disabled when `offset === 0`.

### Error handling

All three error paths are real, visible, and distinct:

- **Loading state:** "Loading restaurants..." in teal, centered.
- **Empty state:** "No results found" in teal with reduced opacity.
- **Error state:** Bordered box with "Error:" and the actual error
  message (e.g. "Request failed: 500" or "Too many requests, please
  wait a moment").

---

## 4. The Data Model

**This app has no data model of its own.** It is a pure API client.
There is no database, no Prisma schema, no server-side data storage.
All data comes from APE-P-I via cross-origin fetch. The app reads
and displays; it never writes.

---

## 5. The Concepts

### Why a separate standalone project vs. same folder

**What:** Daily Meal is in its own folder (`Daily-meal/`), with its
own `package.json`, its own `node_modules`, and its own Next.js dev
server on a different port from APE-P-I.

**Why needed:** The brief requires "a minimal consumer app that calls
the live, deployed URL." If the consumer lived inside APE-P-I's own
folder, it could import Prisma models directly or call server-side
functions — that would prove nothing about the API's real
consumability. Running on a different port forces every data fetch
through a real HTTP request, with real CORS headers, real network
latency, and real error responses. This is the only way to prove the
API actually works from outside its own codebase.

**Implementation:** Two separate `npm run dev` processes on different
ports. `api-config.js` holds the single, changeable URL constant.

### CORS and why it's needed

**What:** Cross-Origin Resource Sharing (CORS) is a browser security
mechanism that controls whether a web page on one origin (e.g.
`localhost:3000`) can request resources from a different origin (e.g.
`localhost:3001`).

**Why needed:** Without CORS headers on APE-P-I's responses, the
browser would block every fetch from Daily Meal. The fix lives on the
API side — APE-P-I must send `Access-Control-Allow-Origin: *` — not
on the client side. Adding a proxy or workaround here would break once
both projects are deployed to their real, separate domains.

**Implementation:** APE-P-I's Next.js config or route handlers include
the CORS header. Daily Meal makes standard `fetch()` calls with no
special configuration.

### The three required states

**What:** Every fetch from the API must visibly handle three states:
loading, empty, and error. The brief's "Excellent" grading band
explicitly requires this.

**Why needed:** A real API client cannot assume the happy path. The
network might fail (error). A filter might match nothing (empty). The
request might take time (loading). Showing a blank screen in any of
these cases is a real bug, not a polish issue.

**Implementation:** A single `state` object with `status` set to
`'loading'`, `'empty'`, `'error'`, or `'success'`. Each status
renders a distinct, visible UI. The 429 (rate limit) is caught
specifically and shown as "Too many requests, please wait a moment"
rather than a generic error, since it's an expected, recoverable
condition.

### The color palette and its exceptions

**What:** `#E4DDD3` (warm beige background) and `#00A19B` (teal
accent) are the only two colors used anywhere in the UI — buttons,
borders, text accents, loading indicators. No third color, no
framework default, no unstyled browser default.

**Why:** The brief specifies these exact two colors. Enforcing a
two-color palette forces deliberate design decisions and prevents
scope creep into "making it pretty" with additional colors.

**Logo exception:** The logo image (`public/logo.png`) contains
black accents (the bowl-and-steam mark, the underline) and a
brighter teal (`#00C8BE`) in the wordmark. These colors appear only
within the logo asset itself and are not introduced anywhere else
in the UI. This is a scoped, documented exception — the logo is a
pre-designed brand asset, not a UI element whose colors should be
matched.

---

## 6. What Went Wrong

### API defaulting to port 3000, colliding with this app

**Symptom:** Both APE-P-I and Daily Meal used `npm run dev`, which
defaults to port 3000. When both were running simultaneously, the
second one failed with `EADDRINUSE` — port 3000 was already taken.

**Investigation:** Checked `package.json` scripts in both projects.
APE-P-I's `dev` script was `next dev` (default port 3000). Daily
Meal's `dev` script was also `next dev` (default port 3000).

**Fix:** Changed Daily Meal's dev script to `next dev -p 3000` and
APE-P-I's to `next dev -p 3001`. Now they run on separate ports
without collision. The `api-config.js` constant points at 3001.

### Cuisine filter case-sensitivity bug

**Symptom:** Typing "italian" in the filter input returned zero
results, despite the API responding 200 every time. The log showed
the request hitting the API correctly — `cuisine=italian` — but
nothing came back.

**Investigation:** Read the Prisma query in APE-P-I's restaurant
list route (`src/app/api/v1/restaurants/route.ts`). The filter was
`where.cuisine = cuisine` — an exact, case-sensitive PostgreSQL
string comparison. The seed data stores `"Italian"` (title-case).
The user typed `"italian"` (lowercase). PostgreSQL compared
`"italian" = "Italian"` and returned false.

**Fix:** Changed the query to
`where.cuisine = { contains: cuisine, mode: "insensitive" }` in
APE-P-I's codebase. This makes the filter case-insensitive and also
supports partial matches (e.g. "ital" matches "Italian"). Confirmed
with real curl output: `?cuisine=italian` now returns 5 Italian
restaurants.

### Folder-lock issues during APE-P-I move

**Symptom:** After moving or renaming the APE-P-I folder, file
operations failed with EBUSY errors — files were locked by running
processes.

**Investigation:** The Next.js dev server and Prisma's language
server had file watchers holding locks on files in the project
directory. Moving the folder while these processes were running
caused conflicts.

**Fix:** Stopped all running Node processes before any folder
operations, then restarted the dev servers after the move completed.

### CORS block against the live API after deployment

**Symptom:** The first load of the deployed app
(`https://daily-meal-one.vercel.app`) showed the error state — no
restaurants loaded. The browser console reported the request to
`https://ape-p-i.vercel.app/api/v1/restaurants?...` blocked by CORS
policy, and the Network tab showed the OPTIONS preflight returning
`405 Method Not Allowed`. The same fetch had worked against the local
API during development, which is the entire reason localhost testing
and production testing behaved differently.

**Investigation:** Daily Meal's fetch code was unchanged — a plain,
unconfigured `fetch()`. The difference was entirely in how the live
API answered the cross-origin preflight. This followed the project's
own cross-origin rule: the failure belonged on the API side, and no
proxy or client-side workaround was added here (a proxy would soften
the real cross-origin boundary this exercise exists to prove).

**Fix:** The fix lived entirely in APE-P-I, not here. APE-P-I added
`src/middleware.ts` that answers OPTIONS preflights with a 204 and
`Access-Control-Allow-Origin: *` (plus the other required CORS headers)
and attaches the CORS headers to all other responses. No code change
was needed in Daily Meal — once APE-P-I was redeployed, the same
deployed app loaded real data on the next request.

---

## 7. What This Slice Does Not Handle

### By design

- **No restaurant detail view.** The brief requires "a list, a filter
  control, and a next page button." Adding a detail view showing
  individual restaurant menus would be real, avoidable scope creep
  beyond "the smallest possible client."

- **No map integration.** Restaurant addresses are displayed as text.
  No map widget, no geocoding, no directions. This is a data display
  app, not a navigation tool.

- **No ordering or checkout.** The app only displays data from the
  API. It never writes to the API. Order creation, cart management,
  and payment are explicitly out of scope.

- **No authentication.** The API has no auth on reads, and this
  consumer has no auth of its own. Anyone can view the page.

- **No loading skeleton or animation.** The loading state is a simple
  text message. A shimmer/skeleton placeholder would be a nice UX
  improvement but is not required by the brief.

---

## 8. If I Built This Again

The single most valuable thing I'd do differently is test the filter
against the actual database values earlier. The case-sensitivity bug
in the cuisine filter was real and went unnoticed until actual browser
testing — the API returned 200 every time, so it looked like it was
working, but zero results meant the filter was silently failing. A
simple curl test with lowercase input would have caught it immediately.

On the architecture side, the decision to keep this as a genuinely
separate project from APE-P-I was correct and worth the minor
overhead of managing two `node_modules` folders and two dev servers.
The cross-origin constraint forced real HTTP behavior from day one,
which is the whole point of the exercise. I would not change that.

The logo addition was a good call but should have been planned from
the start — adding it after the page was built meant removing the
`<h1>` heading and replacing it with the image, which is clean but
would have been more natural as part of the initial page structure.
