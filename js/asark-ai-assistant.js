(() => {
  'use strict';

  const VERIFIED_LINKS = new Map([
    ['/', 'Home'], ['/index.html', 'Home'], ['/technology.html', 'Technology'],
    ['/ai-technology.html', 'AI Technology'], ['/semiconductor.html', 'Semiconductor Systems'],
    ['/vlsi.html', 'VLSI Design'], ['/what-is-vlsi.html', 'What is VLSI?'],
    ['/computing.html', 'Computing Technology'], ['/processor.html', 'Processor Technology'],
    ['/graphics-card.html', 'Graphics Card Technology'], ['/space.html', 'Space Technology'],
    ['/commercial-space-infrastructure.html', 'Commercial Space Infrastructure'],
    ['/market-technology.html', 'Market Technology'], ['/blogs.html', 'ASARK Journal'],
    ['/journal/ai-technology-future.html', 'AI Technology Journal'],
    ['/journal/market-technology-future.html', 'Market Technology Journal'],
    ['/journal/semiconductor-technology-future.html', 'Semiconductor Technology Journal'],
    ['/journal/space-technology-future.html', 'Space Technology Journal'],
    ['/evolution-of-autonomous-ai-systems.html', 'Autonomous AI Systems'],
    ['/art-design.html', 'Art and Design'],
    ['/explore.html', 'Explore ASARK'], ['/stories.html', 'Stories'],
    ['/culture-future.html', 'Culture and Future'],
    ['/guides/ambient-lighting.html', 'Ambient Lighting Guide'],
    ['/guides/coffee-ritual.html', 'Coffee Ritual Guide'],
    ['/guides/intelligent-home-foundation.html', 'Intelligent Home Guide'],
    ['/about.html', 'About ASARK'], ['/contact.html', 'Contact ASARK'],
    ['/privacy.html', 'Privacy Policy'], ['/terms.html', 'Terms and Conditions']
  ]);

  const contextualSuggestions = {
    '/semiconductor.html': ['What is VLSI?', 'Explore semiconductor articles', 'Back to Technology'],
    '/vlsi.html': ['What is VLSI?', 'Explore semiconductor articles', 'Back to Technology'],
    '/what-is-vlsi.html': ['Explore semiconductor articles', 'Explain this page', 'Back to Technology'],
    '/market-technology.html': ['Explain this page', 'Explore market technology', 'Latest Journal'],
    '/space.html': ['Explain this section', 'Explore space infrastructure', 'Latest Journal'],
    '/blogs.html': ['Explore Technology', 'Find semiconductor articles', 'Latest Journal'],
    '/technology.html': ['Explore AI', 'Semiconductor Systems', 'Space Technology', 'Latest Journal']
  };

  const ASARK_AI = {
    config: {
      endpoint: 'http://127.0.0.1:5000/api/asark-ai/chat',
      healthEndpoint: 'http://127.0.0.1:5000/api/asark-ai/health',
      maxHistory: 10,
      storageKey: 'asark-ai-conversation',
      welcomeMessage: "Hi! I'm ASARK AI, your guide to ASARK World. I can help you explore the website, find technology topics, and answer questions about AI, semiconductors, space, markets, programming and emerging technology.",
      suggestions: ['Explore Technology', 'Semiconductors', 'Space', 'Market', 'Latest Journal']
    },
    state: { messages: [], isTyping: false, controller: null },
    dom: {},

    init() {
      if (!document.body) return;
      this.widget = document.querySelector('[data-asark-ai-widget]') || this.createWidget();
      this.cacheDOM();
      this.restoreConversation();
      this.bindEvents();
      this.observePrivacyChoices();
      this.checkHealth();
      window.setInterval(() => this.checkHealth(), 30000);
    },

    createElement(tag, className, text) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    },

    createButton(className, label, title) {
      const button = this.createElement('button', className, label);
      button.type = 'button';
      button.title = title;
      button.setAttribute('aria-label', title);
      return button;
    },

    createWidget() {
      const widget = this.createElement('div', 'asark-ai-widget');
      widget.dataset.asarkAiWidget = '';

      const launcher = this.createButton('asark-ai-launcher', '✦ ASARK AI', 'Open ASARK AI Assistant');
      launcher.id = 'asark-ai-launcher';
      launcher.dataset.asarkAiLauncher = '';
      launcher.setAttribute('aria-controls', 'asark-ai-panel');
      launcher.setAttribute('aria-expanded', 'false');

      const panel = this.createElement('section', 'asark-ai-panel');
      panel.id = 'asark-ai-panel';
      panel.dataset.asarkAiPanel = '';
      panel.setAttribute('aria-label', 'ASARK AI website assistant');
      panel.setAttribute('aria-hidden', 'true');
      panel.inert = true;

      const header = this.createElement('div', 'asark-ai-header');
      const info = this.createElement('div', 'asark-ai-header-info');
      info.append(this.createElement('h2', '', 'ASARK AI'), this.createElement('p', '', 'Website Assistant'));
      const status = this.createElement('div', 'asark-ai-status');
      const dot = this.createElement('span', 'asark-ai-status-indicator');
      dot.dataset.asarkAiStatusDot = '';
      dot.setAttribute('aria-hidden', 'true');
      const statusText = this.createElement('span', '', 'Checking...');
      statusText.dataset.asarkAiStatusText = '';
      status.append(dot, statusText);

      const headerControls = this.createElement('div', 'asark-ai-header-controls');
      const minimize = this.createButton('asark-ai-control-button', 'Minimize', 'Minimize ASARK AI');
      minimize.dataset.asarkAiMinimize = '';
      const close = this.createButton('asark-ai-control-button', 'Close', 'Close ASARK AI');
      close.dataset.asarkAiClose = '';
      headerControls.append(minimize, close);
      info.append(status);
      header.append(info, headerControls);

      const messages = this.createElement('div', 'asark-ai-messages');
      messages.dataset.asarkAiMessages = '';
      messages.setAttribute('aria-live', 'polite');

      const typing = this.createElement('div', 'asark-ai-typing');
      typing.dataset.asarkAiTyping = '';
      typing.setAttribute('aria-live', 'polite');
      typing.append(this.createElement('span'), this.createElement('span'), this.createElement('span'), this.createElement('span', 'asark-ai-typing-label', 'ASARK AI is thinking...'));

      const composer = this.createElement('div', 'asark-ai-composer');
      const input = this.createElement('textarea', 'asark-ai-input');
      input.dataset.asarkAiInput = '';
      input.placeholder = 'Ask ASARK AI...';
      input.rows = 2;
      input.setAttribute('aria-label', 'Message ASARK AI');
      const actions = this.createElement('div', 'asark-ai-actions');
      const clear = this.createButton('asark-ai-button asark-ai-button-secondary', 'Clear', 'Clear Chat');
      clear.dataset.asarkAiClear = '';
      const stop = this.createButton('asark-ai-button', 'Stop', 'Stop generating');
      stop.dataset.asarkAiStop = '';
      stop.disabled = true;
      const send = this.createButton('asark-ai-button asark-ai-button-primary', 'Send', 'Send message');
      send.dataset.asarkAiSend = '';
      actions.append(clear, stop, send);
      composer.append(input, actions);
      panel.append(header, messages, typing, composer);
      widget.append(launcher, panel);
      document.body.append(widget);
      return widget;
    },

    cacheDOM() {
      const find = (name) => this.widget.querySelector(`[data-asark-ai-${name}]`);
      this.dom = {
        panel: find('panel'), launcher: find('launcher'), messages: find('messages'), input: find('input'),
        send: find('send'), clear: find('clear'), stop: find('stop'), minimize: find('minimize'),
        close: find('close'), statusDot: find('status-dot'), statusText: find('status-text'), typing: find('typing')
      };
    },

    bindEvents() {
      this.dom.launcher.addEventListener('click', () => this.setPanelOpen(true));
      document.querySelectorAll('[data-asark-ai-open]').forEach((trigger) => trigger.addEventListener('click', () => this.setPanelOpen(true)));
      [this.dom.minimize, this.dom.close].forEach((button) => button.addEventListener('click', () => this.setPanelOpen(false)));
      document.addEventListener('asark-amazon:opening', () => {
        if (window.matchMedia('(max-width: 900px)').matches && this.dom.panel.classList.contains('open')) this.setPanelOpen(false, false);
      });
      this.dom.send.addEventListener('click', () => this.handleSend());
      this.dom.clear.addEventListener('click', () => this.clearChat());
      this.dom.stop.addEventListener('click', () => this.stopGeneration());
      this.dom.input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.handleSend(); }
      });
      this.dom.panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') this.setPanelOpen(false);
      });
    },

    observePrivacyChoices() {
      const update = () => {
        const controls = [...document.querySelectorAll('.analytics-privacy-control, .analytics-consent-panel')];
        const visible = controls.some((element) => !element.hidden && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
        document.body.classList.toggle('asark-ai-privacy-open', visible);
      };
      const observer = new MutationObserver(update);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
      window.addEventListener('resize', update);
      update();
    },

    setPanelOpen(isOpen, restoreFocus = true) {
      if (isOpen && window.matchMedia('(max-width: 900px)').matches) {
        document.dispatchEvent(new CustomEvent('asark-ai:opening'));
      }
      this.dom.panel.classList.toggle('open', isOpen);
      this.dom.panel.inert = !isOpen;
      this.dom.panel.setAttribute('aria-hidden', String(!isOpen));
      this.dom.launcher.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) this.dom.input.focus();
      else if (restoreFocus) this.dom.launcher.focus();
    },

    async checkHealth() {
      try {
        const response = await fetch(this.config.healthEndpoint, { signal: AbortSignal.timeout(5000) });
        const data = await response.json();
        this.setOnlineStatus(response.ok && data.status === 'ok');
        if (!(response.ok && data.status === 'ok')) console.warn('[ASARK AI] Health check returned:', data);
      } catch (error) {
        this.setOnlineStatus(false);
        console.error('[ASARK AI] Health check failed:', error);
      }
    },

    setOnlineStatus(isOnline) {
      this.dom.statusDot.classList.toggle('online', isOnline);
      this.dom.statusText.textContent = isOnline ? 'Online' : 'Temporarily unavailable';
    },

    restoreConversation() {
      try { this.state.messages = JSON.parse(sessionStorage.getItem(this.config.storageKey)) || []; } catch { this.state.messages = []; }
      if (!Array.isArray(this.state.messages)) this.state.messages = [];
      this.state.messages = this.state.messages
        .filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
        .map((message) => ({ role: message.role, content: message.content, ...(message.role === 'assistant' && message.retry === true ? { retry: true } : {}) }))
        .slice(-this.config.maxHistory);
      if (!this.state.messages.some((message) => message.role === 'user')) this.state.messages = [{ role: 'assistant', content: this.config.welcomeMessage }];
      this.renderMessages();
    },

    persistConversation() {
      try { sessionStorage.setItem(this.config.storageKey, JSON.stringify(this.state.messages)); } catch { /* Conversation remains available in memory if storage is restricted. */ }
    },

    renderMessages() {
      this.dom.messages.replaceChildren();
      this.state.messages.forEach(({ role, content, retry }) => this.renderMessage(role, content, retry));
      if (!this.state.messages.some(({ role }) => role === 'user')) this.renderSuggestions();
      this.dom.messages.scrollTop = this.dom.messages.scrollHeight;
    },

    renderMessage(role, content, retry = false) {
      const element = this.createElement('div', `asark-ai-message asark-ai-message-${role}`);
      if (role !== 'assistant') {
        element.textContent = content;
      } else {
        const linkPattern = /(?:https?:\/\/[^\s)]+)?((?:\/?[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.html|\/)(?:[?#][^\s)]*)?/g;
        let cursor = 0;
        for (const match of content.matchAll(linkPattern)) {
          const path = match[1].startsWith('/') ? match[1] : `/${match[1]}`;
          if (!VERIFIED_LINKS.has(path)) continue;
          const start = match.index;
          element.append(document.createTextNode(content.slice(cursor, start)));
          const link = this.createElement('a', 'asark-ai-link', match[0]);
          link.href = new URL(path, location.origin).href;
          element.append(link);
          cursor = start + match[0].length;
        }
        element.append(document.createTextNode(content.slice(cursor)));
      }
      if (role === 'assistant' && retry) {
        element.append(document.createElement('br'));
        const retryButton = this.createButton('asark-ai-retry', 'Retry', 'Retry the last ASARK AI request');
        retryButton.addEventListener('click', () => this.retryLastRequest());
        element.append(retryButton);
      }
      this.dom.messages.append(element);
    },

    getSuggestions() {
      return contextualSuggestions[location.pathname] || this.config.suggestions;
    },

    renderSuggestions() {
      const suggestions = this.createElement('div', 'asark-ai-suggestions');
      this.getSuggestions().forEach((prompt) => {
        const button = this.createButton('asark-ai-suggestion', prompt, `Ask: ${prompt}`);
        button.addEventListener('click', () => { this.dom.input.value = prompt; this.handleSend(); });
        suggestions.append(button);
      });
      this.dom.messages.append(suggestions);
    },

    getPageContext() {
      return {
        title: document.title.slice(0, 160),
        path: location.pathname,
        section: document.querySelector('main h1')?.textContent?.trim().slice(0, 120) || ''
      };
    },

    addMessage(role, content, options = {}) {
      this.state.messages.push({ role, content, ...(options.retry ? { retry: true } : {}) });
      if (this.state.messages.length > this.config.maxHistory) this.state.messages.splice(0, this.state.messages.length - this.config.maxHistory);
      this.persistConversation();
      this.renderMessages();
    },

    async handleSend(retryText = null) {
      const isRetry = typeof retryText === 'string';
      const text = (isRetry ? retryText : this.dom.input.value).trim();
      if (!text || this.state.isTyping) return;
      this.dom.input.value = '';
      if (isRetry) {
        this.state.messages = this.state.messages.filter((message) => !message.retry);
        this.persistConversation();
        this.renderMessages();
      } else {
        this.state.messages = this.state.messages.filter((message) => !message.retry);
        this.addMessage('user', text);
      }
      this.setTyping(true);
      this.state.controller = new AbortController();
      try {
        const response = await fetch(this.config.endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: this.state.messages, page_context: this.getPageContext() }),
          signal: this.state.controller.signal
        });
        const data = await response.json();
        if (response.status === 504) {
          this.addMessage('assistant', 'ASARK AI took too long to respond. Please try again.', { retry: true });
          return;
        }
        if (!response.ok || typeof data.content !== 'string') throw new Error(data.error || `Request failed (${response.status})`);
        this.addMessage('assistant', data.content);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('[ASARK AI] Chat request failed:', error);
          this.addMessage('assistant', 'ASARK AI is temporarily unavailable. Please try again later.');
        }
      } finally {
        this.state.controller = null;
        this.setTyping(false);
      }
    },

    retryLastRequest() {
      const lastUserMessage = [...this.state.messages].reverse().find((message) => message.role === 'user');
      if (lastUserMessage && !this.state.isTyping) this.handleSend(lastUserMessage.content);
    },

    setTyping(isTyping) {
      this.state.isTyping = isTyping;
      this.dom.typing.hidden = !isTyping;
      this.dom.send.disabled = isTyping;
      this.dom.stop.disabled = !isTyping;
    },

    clearChat() {
      this.stopGeneration();
      this.state.messages = [{ role: 'assistant', content: this.config.welcomeMessage }];
      this.persistConversation();
      this.renderMessages();
    },

    stopGeneration() {
      if (this.state.controller) this.state.controller.abort();
    }
  };

  document.addEventListener('DOMContentLoaded', () => ASARK_AI.init(), { once: true });
})();
