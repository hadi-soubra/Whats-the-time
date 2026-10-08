# What's the Time?

**Your whole life, squeezed into a single day.**

If you expect to live to 80 and you're 20 right now, you've lived 25% of your life. That sounds like a lot. But picture your life as one 24-hour day, where you're born at midnight and it ends at the next midnight, and 25% is **6:00 AM**. The day has barely started. Most people aren't even awake yet.

This site turns that idea into a live clock. You enter your birthday and the age you expect to live to, and it shows you what time it is in your life, on a classic analog clock with a digital readout underneath.

## How it works

Your lifespan is mapped linearly onto 24 hours:

```
life time = (time since birth / expected lifespan) × 24 hours
```

| Expected lifespan | Your age | Life clock |
| ----------------- | -------- | ---------- |
| 80                | 20       | 6:00 AM    |
| 80                | 40       | 12:00 PM   |
| 80                | 60       | 6:00 PM    |
| 90                | 30       | ~8:00 AM   |

With an 80-year lifespan, **one minute on the clock is about 20 days of real life** and **one hour is about 3.3 years**. The clock updates live, though the hands move about as slowly as you'd expect.

The page also shows:

- your exact age, ticking up in real time
- the percentage of the "day" that has passed
- how much real time one clock-minute and one clock-hour represent for you

If you go past the age you entered, the clock stops at midnight and tells you you're on bonus time.

## Privacy

There's no backend. Your birthday and expected age are saved in your browser's `localStorage`, so they're still there the next time you open the site. Nothing is sent anywhere. If you clear your site data, the clock resets.

## Tech stack

- [Angular](https://angular.dev) 22 (standalone components, signals, zoneless change detection)
- The analog clock is hand-drawn SVG with no chart or clock libraries
- Plain CSS with automatic light/dark mode
- Hosted as static files on Cloudflare

## Project structure

```
src/
├── index.html               Page shell, fonts, meta tags
├── styles.css               All styling (light + dark theme)
└── app/
    ├── app.ts / app.html    Main page: inputs, digital clock, stats, localStorage
    ├── life-clock.ts        The math: lifespan → time of day
    └── clock-face/          The analog SVG clock component
public/favicon.svg           Site icon
wrangler.jsonc               Cloudflare Workers config (static assets)
```

## Running locally

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm start
```

Then open http://localhost:4200.

To build for production:

```bash
npm run build
```

The output goes to `dist/whats-the-time/browser/`.

## Deploying to Cloudflare

### Option A: Cloudflare Workers (Cloudflare's recommended path)

1. Push this repo to GitHub.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository** and pick the repo.
3. Use these settings:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (it reads `wrangler.jsonc`)
4. Deploy. The site will be live at `whats-the-time.<your-subdomain>.workers.dev`.

### Option B: Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
2. Use these settings:
   - **Framework preset:** Angular (or None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist/whats-the-time/browser`
3. Deploy. The site will be live at `<project-name>.pages.dev`.

After either setup, every push to `main` redeploys automatically.

### Custom domain

The free `*.workers.dev` / `*.pages.dev` address works fine as is. To use your own domain, add it under the project's **Settings → Domains & Routes** (Workers) or **Custom domains** (Pages). Cloudflare Registrar sells domains at cost, roughly $10/year for a `.com`.
