/**
 * Mock AI Service — generates realistic slide content from a prompt.
 *
 * In production, replace `generateSlides` with a call to Gemini or OpenAI:
 *   const { GoogleGenerativeAI } = await import('@google/generative-ai');
 *   // or import OpenAI from 'openai';
 *
 * The returned array follows the Slide sub-schema structure.
 */

// ── Helpers ────────────────────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Extract key topic words from the prompt
function extractKeywords(prompt) {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'about',
    'this', 'that', 'these', 'those', 'i', 'we', 'our', 'us',
  ]);
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 8);
}

// Build a slide content array for a given presentation topic
function buildSlides(prompt, slideCount, tone, presentationType, audience) {
  const keywords = extractKeywords(prompt);
  const topic = keywords.slice(0, 3).map(capitalize).join(' ') || 'AI-Generated Topic';
  const isStartup = /pitch|startup|fundrais|investor|series/i.test(prompt + presentationType);
  const isFinancial = /financial|revenue|quarter|q[1-4]|budget|forecast/i.test(prompt);
  const isMarketing = /marketing|campaign|brand|audience|channel/i.test(prompt);

  const slideTemplates = [
    // 1 — Title slide
    {
      title: topic,
      subtitle: `A ${presentationType} — ${new Date().getFullYear()}`,
      content: '',
      bullets: [],
      layout: 'title',
      order: 0,
      notes: 'Welcome the audience. Briefly introduce yourself and the agenda.',
    },

    // 2 — Agenda / Overview
    {
      title: 'Agenda',
      subtitle: "What we'll cover today",
      content: '',
      bullets: [
        'Executive Summary',
        'Problem & Opportunity',
        'Our Solution',
        'Market Analysis',
        isFinancial ? 'Financial Highlights' : 'Business Model',
        'Next Steps & Call to Action',
      ],
      layout: 'content',
      order: 1,
      notes: 'Walk through the agenda items briefly.',
    },

    // 3 — Problem / Opportunity
    {
      title: 'The Problem',
      subtitle: 'Understanding the challenge',
      content: `Current approaches to ${keywords[0] || 'this domain'} are fragmented, costly, and difficult to scale. ${audience === 'Executives' ? 'Leadership teams face increasing pressure to' : 'Teams struggle to'} deliver results efficiently.`,
      bullets: [
        `${randomFrom(['70%', '65%', '80%'])} of teams report significant friction in ${keywords[0] || 'existing workflows'}`,
        'Legacy solutions lack real-time insights and AI-driven automation',
        'Manual processes cost organisations an average of $2.4M/year in lost productivity',
      ],
      layout: 'content',
      order: 2,
      notes: 'Emphasise the pain points. Use data where possible.',
    },

    // 4 — Our Solution
    {
      title: 'Our Solution',
      subtitle: `Introducing ${topic}`,
      content: `We provide a cutting-edge platform that transforms how ${audience === 'Executives' ? 'organisations' : 'teams'} approach ${keywords[1] || 'their workflows'}.`,
      bullets: [
        `AI-powered ${keywords[0] || 'automation'} that reduces manual effort by up to 60%`,
        'Real-time analytics and insights dashboard',
        'Seamless integrations with your existing tools',
        'Enterprise-grade security and compliance',
      ],
      layout: 'content',
      order: 3,
      notes: 'Highlight the unique value proposition. Demo if possible.',
    },

    // 5 — Market Opportunity
    {
      title: 'Market Opportunity',
      subtitle: 'Capturing the expanding enterprise SaaS sector',
      content: '',
      bullets: [
        `TAM expected to reach $${randomFrom(['145B', '220B', '89B'])} by ${new Date().getFullYear() + 2}`,
        'Current legacy solutions suffer from high latency and poor UX',
        `Our architecture provides a ${randomFrom(['40%', '35%', '50%'])} cost reduction at scale`,
      ],
      layout: 'content',
      order: 4,
      notes: 'Back up the market size with credible sources.',
    },

    // 6 — Business Model / Financial
    {
      title: isFinancial ? 'Financial Highlights' : 'Business Model',
      subtitle: isFinancial ? `Q${randomFrom(['1','2','3','4'])} ${new Date().getFullYear()} Performance` : 'How we generate value',
      content: '',
      bullets: isFinancial
        ? [
            `Revenue: $${randomFrom(['4.2M', '8.7M', '12.1M'])} (+${randomFrom(['34%', '42%', '28%'])} YoY)`,
            `Gross Margin: ${randomFrom(['72%', '68%', '81%'])}`,
            `ARR: $${randomFrom(['18M', '24M', '9M'])} with ${randomFrom(['140%', '125%', '155%'])} NRR`,
            'Customer Acquisition Cost reduced by 22% through product-led growth',
          ]
        : [
            'Subscription-based SaaS — monthly & annual plans',
            'Enterprise licences with custom SLAs and onboarding',
            'API access and usage-based pricing for high-volume customers',
            'Professional services and training add-ons',
          ],
      layout: 'content',
      order: 5,
      notes: isFinancial ? 'Highlight the most impressive metric first.' : 'Explain each revenue stream clearly.',
    },

    // 7 — Traction / Social Proof
    {
      title: isStartup ? 'Traction' : 'Key Achievements',
      subtitle: 'Proof of impact',
      content: '',
      bullets: [
        `${randomFrom(['500+', '1,200+', '850+'])} active customers in ${randomFrom(['14', '22', '31'])} countries`,
        `${randomFrom(['4.8', '4.9', '4.7'])}/5 average customer satisfaction score`,
        `Featured in ${randomFrom(['Forbes', 'TechCrunch', 'Gartner'])} as a top innovator`,
        `${randomFrom(['$2.5M', '$5M', '$1.8M'])} in contracts signed this quarter`,
      ],
      layout: 'content',
      order: 6,
      notes: 'Use logos of well-known customers where possible.',
    },

    // 8 — Team
    {
      title: 'Our Team',
      subtitle: 'World-class expertise',
      content: 'Backed by decades of combined experience in technology, product, and go-to-market strategy.',
      bullets: [
        'CEO — Former VP at Google Cloud, 15+ years in enterprise software',
        'CTO — Ex-Microsoft Research, PhD in Machine Learning',
        'CMO — Built and scaled 3 successful SaaS brands to exit',
      ],
      layout: 'content',
      order: 7,
      notes: 'Highlight relevant credentials and domain expertise.',
    },

    // 9 — Competitive Advantage
    {
      title: 'Competitive Landscape',
      subtitle: 'Why we win',
      content: '',
      bullets: [
        '10x faster implementation than traditional enterprise solutions',
        'Native AI integration vs. bolt-on features from competitors',
        'Open API-first architecture enables deep customisation',
        `${randomFrom(['ISO 27001', 'SOC 2 Type II', 'GDPR'])} certified — built for enterprise trust`,
      ],
      layout: 'two-column',
      order: 8,
      notes: 'Be honest about competitors. Show where you genuinely differentiate.',
    },

    // 10 — Roadmap
    {
      title: isMarketing ? 'Campaign Roadmap' : 'Product Roadmap',
      subtitle: `${new Date().getFullYear()}–${new Date().getFullYear() + 1} milestones`,
      content: '',
      bullets: [
        `Q${randomFrom(['1','2'])} ${new Date().getFullYear()} — Launch advanced AI features & mobile app`,
        `Q${randomFrom(['3','4'])} ${new Date().getFullYear()} — Expand to APAC and EMEA markets`,
        `Q1 ${new Date().getFullYear() + 1} — Series ${randomFrom(['A','B'])} funding round`,
        `Q2 ${new Date().getFullYear() + 1} — Enterprise marketplace integrations (Salesforce, HubSpot)`,
      ],
      layout: 'content',
      order: 9,
      notes: 'Be realistic. Show you have a clear vision.',
    },

    // 11 — Call to Action / Next Steps
    {
      title: 'Next Steps',
      subtitle: "Let's move forward together",
      content: `We're at an exciting inflection point. Join us in transforming ${keywords[0] || 'the industry'} through the power of AI.`,
      bullets: [
        'Schedule a 30-minute discovery call',
        'Request a personalised demo or pilot programme',
        'Review our detailed technical documentation',
      ],
      layout: 'content',
      order: 10,
      notes: 'End with energy. Repeat your contact information.',
    },

    // 12 — Thank You
    {
      title: 'Thank You',
      subtitle: 'Questions & Discussion',
      content: `contact@${topic.toLowerCase().replace(/\s/g, '')}.ai  •  www.${topic.toLowerCase().replace(/\s/g, '')}.ai`,
      bullets: [],
      layout: 'title',
      order: 11,
      notes: 'Open the floor to questions. Have a one-pager ready.',
    },
  ];

  // Trim or extend to requested count
  const count = slideCount > 0 ? Math.min(slideCount, slideTemplates.length) : slideTemplates.length;
  return slideTemplates.slice(0, count).map((s, i) => ({ ...s, order: i }));
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Generate slides for a presentation.
 * @param {object} opts
 * @param {string} opts.prompt
 * @param {number} [opts.slideCount]
 * @param {string} [opts.tone]
 * @param {string} [opts.presentationType]
 * @param {string} [opts.audience]
 * @returns {Promise<Array>} Array of slide objects
 */
export async function generateSlides({
  prompt = '',
  slideCount = 0,
  tone = 'Professional',
  presentationType = 'Pitch Deck',
  audience = 'General',
} = {}) {
  // Simulate AI processing time (100–400ms)
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 300));

  return buildSlides(prompt, slideCount, tone, presentationType, audience);
}

/**
 * Enhance a single slide's content given an instruction.
 * @param {object} slide  — current slide data
 * @param {string} instruction — e.g. "Make it more concise"
 * @returns {Promise<object>} updated slide data
 */
export async function enhanceSlide(slide, instruction = '') {
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

  const enhanced = { ...slide };

  if (/concise|shorter|brief/i.test(instruction)) {
    enhanced.bullets = (slide.bullets || []).slice(0, 3);
    enhanced.content = (slide.content || '').split('.').slice(0, 1).join('.') + '.';
  } else if (/expand|more detail|elaborate/i.test(instruction)) {
    enhanced.bullets = [
      ...(slide.bullets || []),
      'Additional context: increased operational efficiency by 35%',
      'Supporting data validates the core hypothesis with 95% confidence',
    ];
  } else if (/professional|formal/i.test(instruction)) {
    enhanced.content = (slide.content || '').replace(/we're/gi, 'we are').replace(/it's/gi, 'it is');
  } else {
    // Default: add a suggestion bullet
    enhanced.bullets = [
      ...(slide.bullets || []),
      'AI Suggestion: consider adding a supporting metric or customer quote here.',
    ];
  }

  return enhanced;
}
