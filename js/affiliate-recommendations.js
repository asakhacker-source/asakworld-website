(() => {
  'use strict';

  const AMAZON_TAG = 'asark-21';
  const TOPICS = Object.freeze({
    computing: Object.freeze({
      title: 'Tools for a capable learning desk.',
      description: 'Useful references and hands-on tools for understanding computing systems.',
      links: Object.freeze([['Computing books', 'computer science books'], ['Electronics kits', 'electronics starter kit']])
    }),
    ai: Object.freeze({
      title: 'Continue the AI study.',
      description: 'Useful reading and desk tools for building thoughtful technical foundations.',
      links: Object.freeze([['AI books', 'artificial intelligence books'], ['Development accessories', 'programming accessories']])
    }),
    market: Object.freeze({
      title: 'Read markets with context.',
      description: 'Resources for understanding digital commerce, finance and data-informed decisions.',
      links: Object.freeze([['Business books', 'business and finance books'], ['Data-analysis books', 'data analytics books']])
    }),
    animation: Object.freeze({
      title: 'Build a stronger creative practice.',
      description: 'Selected tools and reading for animation, visual storytelling and digital creation.',
      links: Object.freeze([['Animation books', 'animation books'], ['Drawing tablets', 'drawing tablet']])
    }),
    space: Object.freeze({
      title: 'Keep exploring the sky.',
      description: 'Accessible books and observation tools for learning about space and science.',
      links: Object.freeze([['Space books', 'space exploration books'], ['Beginner telescopes', 'beginner telescope astronomy']])
    }),
    mobility: Object.freeze({
      title: 'Resources for future mobility.',
      description: 'Reading for understanding electric vehicles, systems engineering and transportation design.',
      links: Object.freeze([['Automotive technology books', 'automotive technology books'], ['EV engineering books', 'electric vehicle engineering books']])
    })
  });

  const PAGE_TOPICS = Object.freeze({
    'computing.html': 'computing',
    'vlsi.html': 'computing',
    'processor.html': 'computing',
    'graphics-card.html': 'computing',
    'visual.html': 'animation',
    'journal/ai-technology-future.html': 'ai',
    'journal/market-technology-future.html': 'market',
    'journal/animation-technology-future.html': 'animation',
    'journal/space-technology-future.html': 'space',
    'journal/vehicle-technology-future.html': 'mobility'
  });

  const pagePath = decodeURIComponent(location.pathname.replace(/^\/+/, '')) || 'index.html';
  const topic = TOPICS[PAGE_TOPICS[pagePath]];
  if (!topic || document.querySelector('.page-affiliate, .affiliate-product-section')) return;

  const searchUrl = (query) => {
    const url = new URL('https://www.amazon.in/s');
    url.searchParams.set('k', query);
    url.searchParams.set('tag', AMAZON_TAG);
    return url.href;
  };

  const main = document.querySelector('main');
  if (!main) return;

  const section = document.createElement('section');
  section.className = 'page-affiliate';
  section.setAttribute('aria-labelledby', 'affiliate-resources-title');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Recommended resources';
  const heading = document.createElement('h2');
  heading.id = 'affiliate-resources-title';
  heading.textContent = topic.title;
  const description = document.createElement('p');
  description.className = 'page-affiliate-disclosure';
  description.textContent = topic.description;
  const disclosure = document.createElement('p');
  disclosure.className = 'page-affiliate-disclosure';
  disclosure.textContent = 'As an Amazon Associate I earn from qualifying purchases. Purchases made through these links may support ASARK at no additional cost to you.';
  const links = document.createElement('div');
  links.className = 'page-affiliate-links';

  topic.links.forEach(([label, query]) => {
    const link = document.createElement('a');
    link.href = searchUrl(query);
    link.target = '_blank';
    link.rel = 'sponsored noopener noreferrer';
    link.textContent = label;
    links.append(link);
  });

  section.append(eyebrow, heading, description, disclosure, links);
  main.append(section);
})();
