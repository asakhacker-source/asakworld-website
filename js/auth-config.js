/*
 * Public Supabase browser settings. The anon/publishable key is safe to expose
 * in the browser; never place a service_role key or OAuth client secret here.
 */
window.ASARK_AUTH = Object.freeze({
  supabaseUrl: '',
  supabaseAnonKey: '',
  providers: Object.freeze({
    google: false,
    microsoft: false
  })
});
