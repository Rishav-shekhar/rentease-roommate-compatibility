# RentEase Roommate Compatibility Test

A tiny, no-backend, no-account quiz that scores two people's lifestyle compatibility and gives them a shareable result.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How it works

- Person A takes the 10-question quiz. Their answers are encoded into a URL (`?a=...`).
- Person A copies the invite link and sends it to Person B.
- Person B opens the link, takes the quiz, and the app computes a weighted compatibility score client-side — no database, no server.
- The final result URL (`?a=...&b=...`) is shareable/bookmarkable and re-renders the same score for anyone who opens it.

All logic lives in `lib/quiz.ts` (questions, weights, scoring, URL encode/decode).

## Deploy to https://rentease.in/roommate-compatibility

This project is configured as a fully static export, prefixed for the `/roommate-compatibility` subpath (see `basePath`/`assetPrefix` in `next.config.js`).

```bash
npm install
npm run build
```

This produces a static `out/` folder. Upload the contents of `out/` to whatever serves `rentease.in`, at the path `/roommate-compatibility/` (e.g. as a subfolder on the existing web server, or as a static site / Pages project mounted at that path). No server process, database, or backend is required — it's plain HTML/CSS/JS.

If the subpath ever changes, update `basePath` and `assetPrefix` in `next.config.js` and the `BASE_PATH` constant at the top of `app/page.tsx` (used for the logo image), then rebuild.

## Deploy elsewhere / at the root

To deploy at a domain root instead of a subpath, remove `basePath` and `assetPrefix` from `next.config.js`, set `BASE_PATH` in `app/page.tsx` to `""`, and rebuild.

## Turning on AdSense

Ad placements are already scaffolded as placeholders in `components/AdSlot.tsx` (one inside the questionnaire, one at the bottom of results). Instructions to go live are in the comment at the top of that file — set `NEXT_PUBLIC_ADSENSE_CLIENT` and drop in your two slot IDs once the site is approved.

## Structure

```
app/
  layout.tsx      – metadata, global styles import
  page.tsx         – all UI states: landing, quiz, invite, results
  globals.css      – design tokens + styles
components/
  AdSlot.tsx       – reusable ad placeholder
lib/
  quiz.ts          – questions, scoring, URL encode/decode
```
