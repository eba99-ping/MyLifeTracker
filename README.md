# My Life Tracker v1.1 — AI Pet

Production-ready PWA with Firebase Authentication, profile, planner, Smart Goals, Journal, AI Coach, AI Pet, Tools Hub, Money tracker, light/dark theme and local-data migrations.

## Local preview

Do not open `index.html` with `file://` when testing authentication or PWA behavior. Serve the folder over HTTP, for example with VS Code Live Server, then open the local URL.

No build step is required. The deployment output is the repository root.

## Production domain strategy

Use one permanent canonical domain, ideally `app.yourdomain.com`, and redirect all old Vercel preview/production aliases to it. Avoid changing the canonical domain after launch because Firebase OAuth redirects, installed PWAs and shared links depend on it.

The canonical production URL is `https://my-life-tracker-seven.vercel.app/`. If a custom domain is added later, update `index.html`, `robots.txt` and `sitemap.xml` in the same release.

## GitHub → Vercel deployment checklist

- [ ] Create a private GitHub repository and add these files at repository root.
- [ ] Check that no private keys, service-account JSON, Apple `.p8` keys or admin SDK credentials are committed.
- [ ] Push to `main` and import the repository in Vercel.
- [ ] Framework preset: **Other**; Build command: leave empty; Output directory: `.`.
- [ ] Deploy once and test the generated `*.vercel.app` HTTPS URL.
- [ ] Add the final custom domain in Vercel and select it as the production domain.
- [x] Set the production domain in canonical/social metadata, `robots.txt` and `sitemap.xml`.
- [ ] In Firebase Authentication → Settings → Authorized domains, add the final domain and the required Vercel domain. Do not add random preview domains.
- [ ] In Google Cloud/Firebase OAuth settings, verify authorized redirect URIs and support email.
- [ ] Enable only authentication providers that are actually configured. The UI currently labels Apple as unavailable until Apple Developer/Firebase setup is complete.
- [ ] Review Firestore/Storage Security Rules before enabling cloud data. Never use open test-mode rules in production.
- [ ] Set Firebase App Check when cloud data/API endpoints are introduced.
- [ ] Add a real support email or contact form to `contact.html`.
- [ ] Review Privacy Policy and Terms with appropriate legal advice for the launch region and audience.
- [ ] Test sign-up, login, logout, Google popup/redirect and email verification on desktop and mobile.
- [ ] Verify old local data remains after refresh/update: planner, goals, journal, money, profile, theme and reminders.
- [ ] Test offline reload after one successful online visit.
- [ ] Test PWA install on Android Chrome and iOS Safari (Share → Add to Home Screen).
- [ ] Test light/dark themes, 320 px mobile width, tablet and desktop.
- [ ] Run Lighthouse for Accessibility, Best Practices, SEO and PWA checks.
- [ ] Confirm `/manifest.json`, `/sw.js`, icons, `/privacy`, `/terms`, `/about`, `/contact`, `/robots.txt` and `/sitemap.xml` return 200.
- [ ] Create a tagged release such as `v1.1.0` after production smoke testing.

## Firebase configuration safety

The Firebase Web configuration in `index.html` is a public project identifier, not an admin secret. Production safety depends on Firebase Authentication, Authorized Domains, Security Rules, quotas and App Check. Never place service-account credentials or private keys in browser code.

The app accepts an optional `window.__FIREBASE_CONFIG__` object loaded before the main script if a future deployment needs a different Firebase project. Keep the current fallback until migration is deliberately planned; changing projects silently would disconnect existing cloud accounts/data.

## Release and rollback

Vercel keeps immutable deployments. Promote a tested deployment to production, and roll back by promoting the previous known-good deployment. When changing cached app-shell files, increment `CACHE` in `sw.js` and the visible app version together.

Local storage migration keys are part of the public data contract. Do not rename or clear them without adding an explicit migration first.
