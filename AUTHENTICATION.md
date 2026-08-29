# ASARK Supabase authentication setup

ASARK is a static GitHub Pages website. Authentication runs in the browser against Supabase Auth with configured public browser values. Email/password authentication is enabled; Google and Microsoft remain disabled until separately configured and approved.

## Browser values versus private secrets

`js/auth-config.js` may contain only the public `supabaseUrl` and a public key. Use a modern `sb_publishable_...` key. Legacy JWT keys are accepted only when their decoded payload role is exactly `anon`, for compatibility; decoding classifies the key format and does not verify its signature. `sb_secret_...`, legacy `service_role` JWTs, unknown key formats, Google/Microsoft client secrets, SMTP passwords, and every other private credential are rejected and must never appear in this repository, GitHub Pages, browser storage, or page source. Provider secrets belong only in their provider dashboard and the Supabase dashboard.

## 1. Supabase project and URL configuration

1. Create or select the ASARK Supabase project.
2. In **Authentication → URL Configuration**, set **Site URL** to `https://www.asark.publicvm.com`.
3. Add these exact Redirect URLs:
   - `https://www.asark.publicvm.com/auth-callback.html`
   - `https://www.asark.publicvm.com/reset-password.html` for password recovery
   - `http://127.0.0.1:5500/auth-callback.html` for local testing, if that is your local server URL.
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
- Expiring sessions are refreshed with the refresh token; invalid, expired, or unverifiable sessions are cleared.
- Sign-up, password sign-in, and social-provider controls share a single-flight interaction guard. While one operation is pending, duplicate submits and provider clicks are ignored and all account controls are disabled; a recoverable completion or failure restores them for a deliberate retry.
- Email and password values are captured and validated synchronously before account controls are disabled. The single-flight interaction guard is acquired immediately afterwards, so disabled controls cannot cause FormData to omit values and duplicate requests remain blocked.
- Credential fields and email-auth submit controls render disabled by default. ASARK enables them only after operational authentication JavaScript has initialized with valid configuration; this intentional fail-closed state prevents native password submission if JavaScript or configuration loading fails.
- `js/auth-config.js` is intentionally excluded from the service-worker app shell and is always requested from the network with `no-store`. A service-worker cache rotation is required for this transition so an older app-shell cache cannot keep serving empty or superseded public configuration.
- A retryable session-restoration failure (network, timeout, 408, 429, or 5xx) retains the stored session but renders the navigation signed out until a later verified restoration succeeds. Definitive 400/401/403 responses and malformed, expired, structurally invalid, or unverifiable session data are cleared.
- Logout asks Supabase to revoke the current session, then clears local session data even if the network is unavailable.
- ASARK supports one pending PKCE flow per browser. Starting another social login while one is pending is deliberately blocked. A retryable signup-request failure may reuse its valid pending signup verifier, rather than silently overwriting it. The verifier is held in namespaced durable local storage so a confirmation link can open in a new tab or after a browser restart. Once `auth-callback.html` has received and scrubbed an authorization code, any callback-processing failure clears that pending flow because ASARK does not retain the authorization code for another exchange attempt. Retryable session-restoration failures may retain an already-stored session as described above.
- Callback processing and stored-session restoration are mutually exclusive. The callback page processes a new sign-in on its own, so a delayed restoration of an older local session cannot overwrite it.

## 4. Google OAuth

1. Create a **Web application** OAuth client in Google Cloud.
2. Add `https://www.asark.publicvm.com` as an authorized JavaScript origin.
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

ASARK's `forgot-password.html` sends a recovery request to `/auth/v1/recover` with the fixed redirect URL `https://www.asark.publicvm.com/reset-password.html`. Add that exact URL to **Authentication → URL Configuration → Redirect URLs** before deploying recovery support; it is a manual dashboard prerequisite.

Supabase intentionally returns a non-enumerating result for unknown email addresses. ASARK therefore always displays the same confirmation message after a successful request. The reset page accepts only the supported implicit recovery return format: a `type=recovery` bearer session in the URL fragment. It immediately removes the fragment from the visible URL, verifies the session through `/auth/v1/user`, and enables the new-password controls only after verification. The recovery session is used only for `PUT /auth/v1/user`, then revoked locally and remotely after a successful update so the visitor returns to a clean logged-out state.
