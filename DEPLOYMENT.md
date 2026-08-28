# ASARK Deployment

## Production origin

The approved public origin is `https://www.asark.publicvm.com/`. The GitHub Pages workflow and `CNAME` file deploy this static repository for that hostname. Configure the hosting, proxy, CDN, or dedicated redirect layer to redirect the alternate non-`www` host to `https://www.asark.publicvm.com/`; DNS alone does not issue HTTP redirects.

## Pre-deployment checks

- Start from a clean Git working tree.
- Confirm `sitemap.xml` contains 45 public URLs and `robots.txt` points to the production sitemap.
- Confirm `manifest.webmanifest` and every `service-worker.js` `APP_SHELL` resource exist.
- Confirm no private secrets are committed.
- Confirm the approved Semiconductor, Market, and Vehicle feature WebP assets are present and have not been replaced with legacy or untracked source imagery.
- Understand whether authentication is intentionally disabled or has owner-supplied public Supabase configuration.

## Authentication

Authentication remains disabled until the owner supplies the Supabase project URL and public anon/publishable key in `js/auth-config.js`. Never place a `service_role` key, database password, OAuth client secret, or private key in browser JavaScript.

When Supabase is enabled, the production CSP must allow the exact configured Supabase project origin in `connect-src`; do not use a wildcard.

## HTTPS and security headers

Serve the site over HTTPS. GitHub Pages does not natively provide general per-site arbitrary custom response-header configuration from this repository. If these headers are required, apply them through a CDN/proxy, external edge configuration, or hosting that supports custom headers. Configure these as HTTP response headers, not HTML meta substitutes:

- `Content-Security-Policy` with a restrictive policy based on the resources the site actually uses; use `frame-ancestors 'none'` if framing is not required.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` only after confirming the HTTPS and subdomain policy; do not enable `includeSubDomains` or preload without that decision.

`frame-ancestors` is enforced only when delivered in an HTTP `Content-Security-Policy` response header. A CSP meta element cannot provide anti-framing protection, so configure that directive at the hosting or CDN layer.

## 404 handling

`404.html` is included for GitHub Pages. Confirm the hosting layer serves it with an HTTP 404 status rather than HTTP 200.

## Cache and PWA

Current deployment source versions are `style.css?v=64`, `site.js?v=67`, and service-worker cache `asark-app-v68`. Change versions only when their underlying CSS, JavaScript, or service-worker behavior changes.

## Post-deployment smoke test

Test Home, Technology, Journal, Visuals, Resources, About, one Journal article, one Technology guide, login, signup, offline behavior, the manifest, and the service worker. Confirm HTTPS, navigation, responsive layout, images, canonical URLs, and no console-breaking JavaScript errors. If Supabase is still unconfigured, login and signup should show their configuration message rather than submit credentials.
