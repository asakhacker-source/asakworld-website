(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-TYQQCJJVQZ';
  const CONSENT_KEY = 'asark.analytics.consent.v1';
  const VALID_CONSENT = new Set(['granted', 'denied']);
  const EXCLUDED_PAGES = new Set([
    'login.html', 'signup.html', 'forgot-password.html', 'reset-password.html',
    'auth-callback.html', 'offline.html', '404.html'
  ]);

  const currentPage = () => location.pathname.split('/').pop() || 'index.html';
  const hasSensitiveAuthState = () => {
    const query = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(location.hash.replace(/^#/, ''));
    const hasAuthParameters = (params) => params.has('code') || params.has('access_token') ||
      params.has('refresh_token') || params.getAll('type').includes('recovery');
    return hasAuthParameters(query) || hasAuthParameters(fragment);
  };

  if (EXCLUDED_PAGES.has(currentPage()) || hasSensitiveAuthState()) return;

  const getConsent = () => {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return VALID_CONSENT.has(value) ? value : null;
    } catch {
      return null;
    }
  };

  const setConsent = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  };

  const safePageLocation = () => `${location.origin}${location.pathname}`;
  let analyticsLoaded = false;

  const updateGoogleConsent = (analyticsStorage) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: analyticsStorage,
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  };

  const loadAnalytics = () => {
    if (getConsent() !== 'granted') return;
    if (analyticsLoaded) {
      updateGoogleConsent('granted');
      return;
    }
    analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'granted',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      page_location: safePageLocation(),
      page_referrer: '',
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  };

  const createControls = () => {
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'analytics-privacy-control';
    control.textContent = 'Privacy choices';
    control.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('section');
    panel.className = 'analytics-consent-panel';
    panel.setAttribute('aria-label', 'Analytics privacy choices');
    const message = document.createElement('p');
    message.textContent = 'ASARK uses optional analytics to understand site traffic and improve content. Analytics will load only if you accept.';
    const actions = document.createElement('div');
    actions.className = 'analytics-consent-actions';
    const accept = document.createElement('button');
    accept.type = 'button';
    accept.dataset.analyticsChoice = 'granted';
    accept.textContent = 'Accept analytics';
    const reject = document.createElement('button');
    reject.type = 'button';
    reject.dataset.analyticsChoice = 'denied';
    reject.textContent = 'Reject';
    actions.append(accept, reject);
    panel.append(message, actions);

    const setPanelVisible = (visible) => {
      panel.hidden = !visible;
      control.setAttribute('aria-expanded', String(visible));
    };

    control.addEventListener('click', () => setPanelVisible(panel.hidden));
    panel.addEventListener('click', (event) => {
      const source = event.target instanceof Element ? event.target.closest('[data-analytics-choice]') : null;
      const choice = source?.dataset.analyticsChoice;
      if (!VALID_CONSENT.has(choice)) return;
      setConsent(choice);
      setPanelVisible(false);
      if (choice === 'granted') {
        loadAnalytics();
      } else {
        updateGoogleConsent('denied');
      }
    });

    document.body.append(panel, control);
    const existingConsent = getConsent();
    setPanelVisible(existingConsent === null);
    if (existingConsent === 'granted') loadAnalytics();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createControls, { once: true });
  } else {
    createControls();
  }
})();
