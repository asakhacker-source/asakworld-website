# ASARK Supabase authentication setup

ASARK is a static GitHub Pages website. Authentication runs in the browser against Supabase Auth with configured public browser values. Email/password authentication is enabled; Google and Microsoft remain disabled until separately configured and approved.

## Browser values versus private secrets

`js/auth-config.js` may contain only the public `supabaseUrl` and a public key. Use a modern `sb_publishable_...` key. Legacy JWT keys are accepted only when their decoded payload role is exactly `anon`, for compatibility; decoding classifies the key format and does not verify its signature. `sb_secret_...`, legacy `service_role` JWTs, unknown key formats, Google/Microsoft client secrets, SMTP passwords, and every other private credential are rejected and must never appear in this repository, GitHub Pages, browser storage, or page source. Provider secrets belong only in their provider dashboard and the Supabase dashboard.

## 1. Supabase project and URL configuration

1. Create or select the ASARK Supabase project.
2. In **Authentication → URL Configuration**, set **Site URL** to `https://asarkworld.com`.
3. Add these exact Redirect URLs:
   - `https://asarkworld.com/auth-callback.html`
   - `https://asarkworld.com/reset-password.html` for password recovery
   - `http://localhost:8000/auth-callback.html` and `http://localhost:8000/reset-password.html` for the current local testing environment.
   - `http://127.0.0.1:5500/auth-callback.html` only if you intentionally retain that older local-server redirect in the Supabase allowlist; it is not the current recommended local environment.
4. Enable **Confirm email**. Set the **Email OTP Expiration** to one hour to match ASARK's `AUTH_SIGNUP_FLOW_MAX_AGE_MS`; if that dashboard setting changes, update the verifier lifetime in `js/site.js` to the same duration. The callback page completes verification with PKCE; do not point confirmation emails at `index.html`.
5. Configure production email delivery and test confirmation mail before public launch.
6. Use Supabase Auth rate limits and password-protection settings appropriate for production. Do not enable automatic confirmation just to simplify testing.

## 2. Public browser configuration

After the project is configured, place only its public values in `js/auth-config.js`:

```js
window.ASARK_AUTH = Object.freeze({
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-public-publishable-or-anon-key',
  providers: Object.freeze({ google: false, microsoft: false })
});
```

Before deploying those values, add the exact same `https://your-project-ref.supabase.co` origin to `connect-src` in the restrictive CSPs on `login.html`, `signup.html`, and `auth-callback.html`, and in every existing ASARK CSP that loads authentication-aware JavaScript. Do not use a wildcard and do not relax `script-src`.

If either public value is missing or malformed, ASARK keeps Log in and Sign up hidden and makes no authentication request.

ASARK parses the configured project URL with `URL()` and accepts only a canonical HTTPS `<project-ref>.supabase.co` origin. URL credentials, non-default ports, paths, query strings, fragments, and lookalike domains are rejected. Malformed configuration remains fail-closed and cannot receive authentication requests.

The provider flags are public, contain no secrets, and default to `false`. Email/password authentication is independent: it can operate after general Supabase configuration while both OAuth providers remain disabled. Enable a provider flag only after that provider has been configured and tested in Supabase.

Activation order: configure the Supabase project; set the Site URL and Redirect URL; allow the exact Supabase origin in CSP; add the public project URL and key; verify email/password; configure and test Google in Supabase, then set `google: true`; configure and test Microsoft in Supabase, then set `microsoft: true`.

## 3. Email sign-up and login

- Sign-up sends users to Supabase for email confirmation and shows a verification-pending message when no session is returned. The pending signup verifier is retained for the configured Email OTP Expiration (one hour by default for ASARK), not for the separate short authorization-code exchange lifetime.
- Password login and callback sessions are verified with Supabase `/auth/v1/user` before ASARK stores them.
- Ordinary persistent sessions use lifecycle-scoped v3 storage: `asark.auth.session.v3.<lifecycle-revision>`. The envelope repeats that revision and is eligible for restoration only when both revisions exactly equal the current `asark.auth.lifecycle.v1` value, followed by Supabase verification. The lifecycle revision—not physical deletion of stale bytes—is the cross-tab trust boundary.
- `asark.auth.session.v2` and legacy `asark.auth.session` values are obsolete, never restored, and never automatically migrated. Deploying v3 intentionally signs out users who only have a v2 session; they must sign in again.
- Normal non-refresh restoration reads, verifies, re-checks the exact current raw envelope, and renders without rewriting shared session storage. A definitive restore or refresh failure can invalidate ordinary auth only when that exact source envelope is still authoritative; malformed or obsolete bytes are never trusted, but physical deletion is not the security boundary.
- Starting password login, sign-up, or social authentication deliberately creates a fresh ordinary-auth lifecycle before its first authentication request. It immediately makes the prior local lifecycle obsolete; if the replacement attempt fails or needs email confirmation, the prior session is not restored.
- Expiring current-lifecycle sessions are refreshed with the refresh token. Concurrent same-lifecycle refreshes across tabs remain server-sensitive; ASARK does not claim cross-tab refresh serialization.
- Sign-up, password sign-in, and social-provider controls share a single-flight interaction guard. While one operation is pending, duplicate submits and provider clicks are ignored and all account controls are disabled; a recoverable completion or failure restores them for a deliberate retry.
- Email and password values are captured and validated synchronously before account controls are disabled. The single-flight interaction guard is acquired immediately afterwards, so disabled controls cannot cause FormData to omit values and duplicate requests remain blocked.
- Credential fields and email-auth submit controls render disabled by default. ASARK enables them only after operational authentication JavaScript has initialized with valid configuration; this intentional fail-closed state prevents native password submission if JavaScript or configuration loading fails.
- `js/auth-config.js` is intentionally excluded from the service-worker app shell and is always requested from the network with `no-store`. A service-worker cache rotation is required for this transition so an older app-shell cache cannot keep serving empty or superseded public configuration.
- A retryable session-restoration failure (network, timeout, 408, 429, or 5xx) retains the stored session but renders the navigation signed out until a later verified restoration succeeds. Definitive failures invalidate only an exact authoritative source envelope; malformed, expired, structurally invalid, or unverifiable data is never trusted. Physical cleanup is best effort, not the trust boundary.
- Each deliberate password, sign-up, or social attempt creates its own replacement lifecycle before network work. The attempt whose lifecycle remains authoritative may complete locally; an older attempt cannot overwrite a newer lifecycle. A logout rotates the lifecycle before best-effort cleanup, so stale bytes may remain but are never trusted.
- Logout captures the current access token, rotates the local lifecycle and renders signed-out navigation before best-effort cleanup and Supabase revocation. It then redirects home even if the network is unavailable.
- PKCE flows use lifecycle-scoped `asark.auth.pkce.v2.<lifecycle-revision>` keys. The old global `asark.auth.pkce.v1` format is obsolete, never restored or migrated, and may be removed only as best-effort hygiene. A stale lifecycle or callback can therefore never remove a newer lifecycle's verifier. Visiting `auth-callback.html` without a code, or a failed/unmatched callback, leaves an unrelated pending flow untouched. Only a successful current-flow exchange consumes its own verifier. This migration invalidates any pending old-v1 confirmation or OAuth flow; affected users must restart authentication.
- Callback processing and stored-session restoration are mutually exclusive. The callback page processes a new sign-in on its own, so a delayed restoration of an older local session cannot overwrite it.

## 4. Google OAuth

1. Create a **Web application** OAuth client in Google Cloud.
2. Add `https://asarkworld.com` as an authorized JavaScript origin.
3. Add Supabase's callback URL as the authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`.
4. In **Supabase → Authentication → Providers → Google**, enable Google and enter the Google client ID and client secret there only.
5. Keep ASARK's `auth-callback.html` URL in Supabase's Redirect URL allowlist.

## 5. Microsoft OAuth

1. Create an application registration in Microsoft Entra ID.
2. Add this Web redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`.
3. In **Supabase → Authentication → Providers → Azure**, enter the Microsoft client ID, client secret, and Azure Tenant URL there only. The tenant URL format is `https://login.microsoftonline.com/<tenant-id>`.
4. Enable the provider. ASARK requests the `email` scope and uses the same callback page.

## 6. Security and verification checklist

- Verify invalid or empty configuration makes no request to Supabase.
- Test sign-up, confirmation email, verified login, logout, refresh, expiry, and a manually expired session.
- Test Google and Microsoft in separate browser sessions, including cancelled consent and denied access.
- Confirm `/auth-callback.html` rejects missing/expired codes and strips URL parameters after processing.
- Confirm `/auth-callback.html` strips its complete query string and fragment before any configuration check or request; provider errors are intentionally shown only as a generic message.
- Confirm no `access_token` URL fragment is persisted and no token/password appears in browser logs.
- Confirm CSP allows only ASARK and the exact configured Supabase project for connections. The authentication-page CSPs are meta policies and intentionally do not claim to provide `frame-ancestors` protection; anti-framing requires a real `Content-Security-Policy` HTTP response header from the hosting/CDN layer.
- Confirm the service worker does not cache callback responses or URLs carrying auth codes.
- Confirm public navigation shows account actions only after valid configuration and a verified session.

Supabase references: [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), and [Microsoft/Azure](https://supabase.com/docs/guides/auth/social-login/auth-azure).

## 7. Password recovery

ASARK's `forgot-password.html` sends a recovery request to `/auth/v1/recover` with a reset URL derived from the configured site root. In production this is `https://asarkworld.com/reset-password.html`; add that exact URL to **Authentication → URL Configuration → Redirect URLs** before deploying recovery support. It is a manual dashboard prerequisite.

Supabase intentionally returns a non-enumerating result for unknown email addresses. ASARK therefore always displays the same confirmation message after a successful request. The reset page accepts only the supported implicit recovery return format: a `type=recovery` bearer session in the URL fragment. It immediately removes the fragment from the visible URL, verifies the session through `/auth/v1/user`, and enables the new-password controls only after verification. The recovery session is used only for `PUT /auth/v1/user`; after a successful update, ASARK clears it locally and attempts remote logout so the visitor returns to a clean logged-out state.
