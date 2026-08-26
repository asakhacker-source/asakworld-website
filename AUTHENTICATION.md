# ASARK authentication setup

This website uses Supabase Auth as its managed authentication backend. The browser connects directly to Supabase using only a public project URL and publishable/anon key. Never add a Supabase `service_role` key, Google client secret, or Microsoft client secret to this repository.

## 1. Create and configure Supabase

1. Create a Supabase project.
2. In **Authentication → URL Configuration**, set the Site URL to `https://www.asark.publicvm.com` and add that URL to the Redirect URLs list. Add your local development URL too, for example `http://127.0.0.1:5500`.
3. In **Authentication → Providers**, enable Email, Google, and Azure (Microsoft).
4. Copy the Project URL and public publishable/anon key into `js/auth-config.js`.

## 2. Configure Google

Create an OAuth client in Google Cloud and set its authorised redirect URI to:

`https://<your-project-ref>.supabase.co/auth/v1/callback`

Enter the Google client ID and secret only in the Supabase Google provider settings.

## 3. Configure Microsoft

Create an Azure Entra ID app registration and set its web redirect URI to:

`https://<your-project-ref>.supabase.co/auth/v1/callback`

Enter the Microsoft client ID, secret, and tenant URL only in the Supabase Azure provider settings.

## Security checklist

- Keep email confirmation enabled for production.
- Use only HTTPS for production redirect URLs.
- Restrict Supabase Redirect URLs to ASARK domains you control.
- Do not commit private keys or provider secrets.
