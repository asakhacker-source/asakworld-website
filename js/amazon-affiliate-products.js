(() => {
  'use strict';

  // Owner-supplied SiteStripe links paired with original ASARK category artwork.
  // Short-link codes are not ASINs. Only the one explicitly confirmed ASIN is stored.
  const AMAZON_AFFILIATE_PRODUCTS = Object.freeze([
    { id: 'ai-intel-core-ultra-9-285k', asin: null, category: 'AI', title: 'Intel® Core Ultra 9 Processor 285K, LGA1851 (36M Cache—up to 5.70 GHz)', url: 'https://link.amazon/B01UJSVgk', image: 'assets/images/affiliate/amazon-ai.webp', alt: 'Original ASARK illustration for the AI category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'ai-amazon-echo-dot-5', asin: null, category: 'AI', title: 'Amazon Echo Dot (5th Gen) | Smart Speaker with Vibrant Sound, Motion Detection, Temperature Sensor, Alexa and Bluetooth | Blue', url: 'https://link.amazon/B0iBMq9Vb', image: 'assets/images/affiliate/amazon-ai.webp', alt: 'Original ASARK illustration for the AI category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'ai-emo-go-home-robot', asin: null, category: 'AI', title: 'EMO Go Home AI Desktop Pet Robot with EMO Smart Lighting (Home Station)', url: 'https://link.amazon/B02wQ2pWm', image: 'assets/images/affiliate/amazon-ai.webp', alt: 'Original ASARK illustration for the AI category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'semiconductor-astem-building-blocks', asin: null, category: 'SEMICONDUCTOR', title: 'ASTEM Adults 36Pcs Power-Function Building Blocks Set – Battery Box, IR Speed Remote Control, IR Receiver, Motor and Power-Function Light', url: 'https://link.amazon/B01q6nJ7T', image: 'assets/images/affiliate/amazon-semiconductor.webp', alt: 'Original ASARK illustration for the semiconductor category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'semiconductor-nano-chips-2030', asin: null, category: 'SEMICONDUCTOR', title: 'Nano-chips 2030: On-chip AI for an Efficient Data-driven World (Frontiers Collection)', url: 'https://link.amazon/B0gbWuEbR', image: 'assets/images/affiliate/amazon-semiconductor.webp', alt: 'Original ASARK illustration for the semiconductor category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'semiconductor-digilent-basys3', asin: null, category: 'SEMICONDUCTOR', title: 'Digilent Basys3 Xilinx Artix-7 FPGA Board', url: 'https://link.amazon/B04tXdCeB', image: 'assets/images/affiliate/amazon-semiconductor.webp', alt: 'Original ASARK illustration for the semiconductor category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'space-knowledge-encyclopedia', asin: '9390391741', category: 'SPACE', title: 'Space – Collection of 6 Books: Knowledge Encyclopedia for Children', url: 'https://link.amazon/B08fPOVsz', image: 'assets/images/affiliate/amazon-space.webp', alt: 'Original ASARK illustration for the space category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'space-pie-matrix-draco', asin: null, category: 'SPACE', title: 'Pie Matrix Draco 90800 Reflector Telescope – 90mm Aperture, 800mm Focal, ALT-AZ Side ARM Mount, Smartphone Adapter and Tripod', url: 'https://link.amazon/B0hYKsq8v', image: 'assets/images/affiliate/amazon-space.webp', alt: 'Original ASARK illustration for the space category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'space-gesto-planetarium', asin: null, category: 'SPACE', title: 'Gesto Planetarium Galaxy Projector – 13 Replaceable Discs, 4K HD Star Light Projector with Dynamic Meteors, 360° Rotation and Nebula', url: 'https://link.amazon/B0gJtRmlL', image: 'assets/images/affiliate/amazon-space.webp', alt: 'Original ASARK illustration for the space category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'market-martech-playbook', asin: null, category: 'MARKET', title: 'The MarTech Playbook: 10 Practical Frameworks for Data, Automation & AI to Build Scalable, ROI-Driven Marketing Strategies', url: 'https://link.amazon/B01XYYZYJ', image: 'assets/images/affiliate/amazon-market.webp', alt: 'Original ASARK illustration for the market category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'market-wizards', asin: null, category: 'MARKET', title: 'Market Wizards: Interviews with Top Traders', url: 'https://link.amazon/B04GWCixU', image: 'assets/images/affiliate/amazon-market.webp', alt: 'Original ASARK illustration for the market category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'market-algo-trading-cheat-codes', asin: null, category: 'MARKET', title: 'Algo Trading Cheat Codes: Techniques for Traders to Quickly and Efficiently Develop Better Algorithmic Trading Systems', url: 'https://link.amazon/B0iuNZmkg', image: 'assets/images/affiliate/amazon-market.webp', alt: 'Original ASARK illustration for the market category.', approvedAffiliateLink: true, originalArtwork: true },
  ]);

  const GENERAL_CATEGORY = 'GENERAL';
  const MAIN_PAGE_OFFSETS = Object.freeze({
    'index.html': 0,
    'blogs.html': 2,
    'technology.html': 0
  });
  const MAIN_PAGE_CATEGORIES = Object.freeze(['AI', 'SEMICONDUCTOR', 'SPACE', 'MARKET']);
  const PAGE_FEATURED_PRODUCTS = Object.freeze({
    'what-is-vlsi.html': 'ai-intel-core-ultra-9-285k'
  });
  const PAGE_CATEGORIES = Object.freeze({
    'ai-technology.html': 'AI', 'computing.html': 'AI', 'graphics-card.html': 'AI',
    'processor.html': 'SEMICONDUCTOR', 'semiconductor.html': 'SEMICONDUCTOR', 'vlsi.html': 'SEMICONDUCTOR',
    'what-is-vlsi.html': 'SEMICONDUCTOR',
    'market-technology.html': 'MARKET',
    'space.html': 'SPACE', 'commercial-space-infrastructure.html': 'SPACE',
    'evolution-of-autonomous-ai-systems.html': 'AI',
    'journal/ai-technology-future.html': 'AI', 'journal/semiconductor-technology-future.html': 'SEMICONDUCTOR',
    'journal/market-technology-future.html': 'MARKET',
    'journal/space-technology-future.html': 'SPACE'
  });

  window.ASARK_AMAZON_AFFILIATE_CATALOG = Object.freeze({
    products: AMAZON_AFFILIATE_PRODUCTS,
    pageCategories: PAGE_CATEGORIES,
    mainPageOffsets: MAIN_PAGE_OFFSETS,
    mainPageCategories: MAIN_PAGE_CATEGORIES,
    featuredProducts: PAGE_FEATURED_PRODUCTS,
    generalCategory: GENERAL_CATEGORY
  });
})();
