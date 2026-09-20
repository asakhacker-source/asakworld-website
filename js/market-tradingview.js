(() => {
  'use strict';

  const widgetScripts = {
    timeline: 'embed-widget-timeline.js',
    'symbol-overview': 'embed-widget-symbol-overview.js',
    'advanced-chart': 'embed-widget-advanced-chart.js'
  };

  document.querySelectorAll('.tradingview-widget-config').forEach((configNode) => {
    const container = configNode.closest('.tradingview-widget-container');
    const widget = configNode.dataset.widget;
    const file = widgetScripts[widget];
    const target = container?.querySelector('.tradingview-widget-container__widget');
    if (!container || !file || !target) {
      console.error('[ASARK Market] Invalid TradingView widget configuration.', configNode);
      return;
    }

    let config;
    try {
      config = JSON.parse(configNode.textContent);
    } catch (error) {
      console.error('[ASARK Market] Could not parse TradingView widget configuration.', error);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://s3.tradingview.com/external-embedding/${file}`;
    script.textContent = JSON.stringify(config);
    target.append(script);
    configNode.remove();
  });
})();
