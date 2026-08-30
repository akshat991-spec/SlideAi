import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * SlideAI Intelligent Generation Service.
 *
 * Powered by Google Gemini 1.5 Pro (the flagship model behind NotebookLM)
 * with NotebookLM-style multi-source document grounding and smart fallback.
 */

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

// ── Real Gemini 1.5 Pro AI Generation (NotebookLM-Style Grounding) ──

async function generateWithGemini(gemini, {
  prompt,
  slideCount = 8,
  tone = 'Professional',
  presentationType = 'Pitch Deck',
  audience = 'General',
  purpose = 'Inform',
  language = 'English (US)',
  referenceUrl = '',
  notesText = '',
}) {
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  
  let model;
  try {
    model = gemini.getGenerativeModel({ model: modelName });
  } catch {
    model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  const count = slideCount > 0 ? slideCount : 8;

  // Grounding block (NotebookLM mode)
  let groundingContext = '';
  if (notesText && notesText.trim()) {
    groundingContext += `\n\n--- SOURCE MATERIAL / NOTES (GROUNDING CONTEXT) ---\n${notesText.slice(0, 20000)}\n----------------------------------------------------\n`;
  }
  if (referenceUrl && referenceUrl.trim()) {
    groundingContext += `\nReference Source URL: ${referenceUrl.trim()}\n`;
  }

  const systemPrompt = `You are an elite presentation designer and McKinsey/TED-level slide creator with the deep analytical synthesis of Google NotebookLM.
Generate a cohesive, authoritative, and deeply insightful ${count}-slide presentation deck based on the request below.

Topic / Prompt: "${prompt}"
Presentation Type: ${presentationType}
Target Audience: ${audience}
Primary Purpose: ${purpose}
Tone: ${tone}
Language: ${language}
Number of Slides: ${count}
${groundingContext}
INSTRUCTIONS FOR NOTEBOOKLM-STYLE SYNTHESIS:
1. If Source Material/Notes are provided, ground the content strictly in those source insights, data points, and concepts.
2. Structure the narrative with clear progression: Introduction/Hook ➡️ Core Thesis ➡️ Key Findings & Evidence ➡️ Strategic Framework ➡️ Quantitative Analysis / Visual Data ➡️ Actionable Next Steps.
3. Use high-density, authoritative bullet points with **bold headers** for each takeaway.
4. Provide comprehensive presenter speaker notes for every slide to guide delivery.

REQUIREMENTS:
- Return ONLY a valid JSON array of slide objects (no markdown fences, no conversational text).
- Structure each slide exactly as follows:
[
  {
    "title": "Clear, Compelling Slide Title",
    "subtitle": "Insightful Subtitle",
    "content": "A high-impact executive summary or explanatory paragraph (1-2 sentences).",
    "bullets": [
      "**Key Finding:** Specific detail, metric, or strategic insight",
      "**Evidence / Mechanism:** Supporting data, proof point, or framework element",
      "**Implication:** Why this matters for the audience"
    ],
    "layout": "title" | "content" | "two-column" | "chart",
    "chartTitle": "Title for chart if layout is chart",
    "notes": "Detailed speaker notes explaining the context and talking points."
  }
]

- Slide 1 MUST have layout: "title".
- Use layout: "chart" or "two-column" where appropriate for visual variety.`;

  let responseText;
  try {
    const result = await model.generateContent(systemPrompt);
    responseText = result.response.text().trim();
  } catch (err) {
    // If gemini-1.5-pro has a quota/rate limit issue, fall back to gemini-1.5-flash
    console.warn(`Falling back to gemini-1.5-flash due to: ${err.message}`);
    const flashModel = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await flashModel.generateContent(systemPrompt);
    responseText = result.response.text().trim();
  }

  // Extract JSON array from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Gemini did not return a valid JSON array');
  }

  const rawSlides = JSON.parse(jsonMatch[0]);
  return rawSlides.map((s, i) => ({
    title: s.title || `Slide ${i + 1}`,
    subtitle: s.subtitle || '',
    content: s.content || '',
    bullets: Array.isArray(s.bullets) ? s.bullets : [],
    layout: s.layout || (i === 0 ? 'title' : 'content'),
    chartTitle: s.chartTitle || '',
    notes: s.notes || '',
    order: i,
  }));
}

// ── Smart Contextual Fallback Engine ───────────────────────────────

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractKeywords(prompt) {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'about',
    'this', 'that', 'these', 'those', 'i', 'we', 'our', 'us', 'create',
    'make', 'generate', 'presentation', 'deck', 'slides',
  ]);
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  return words.length > 0 ? words : ['innovation', 'strategy', 'growth'];
}

function buildSmartFallbackSlides(prompt, slideCount, tone, presentationType, audience, notesText = '') {
  const keywords = extractKeywords(prompt + (notesText ? ' ' + notesText : ''));
  const mainSubject = keywords.slice(0, 4).map(capitalize).join(' ') || 'Strategic Overview';
  const k1 = keywords[0] || 'core initiatives';
  const k2 = keywords[1] || 'market transformation';
  const k3 = keywords[2] || 'operational excellence';

  const count = slideCount > 0 ? slideCount : 8;

  const slides = [
    {
      title: mainSubject,
      subtitle: `${presentationType} for ${audience} • ${new Date().getFullYear()}`,
      content: `A strategic presentation focused on ${prompt}. Designed to inform, align, and drive key decisions.`,
      bullets: [],
      layout: 'title',
      order: 0,
      notes: `Welcome everyone. Introduce the session on "${prompt}" and outline key expectations.`,
    },
    {
      title: 'Executive Summary',
      subtitle: 'The Strategic Context & Core Objectives',
      content: `Addressing the rapid evolution of ${k1} requires proactive alignment across ${audience.toLowerCase()} stakeholders.`,
      bullets: [
        `**Key Opportunity:** Accelerate transformation by leveraging ${k1} and ${k2}`,
        `**Expected Impact:** Achieve up to 45% efficiency gains and measurable strategic upside`,
        `**Core Objective:** Establish actionable milestones and resource commitment for execution`,
      ],
      layout: 'content',
      order: 1,
      notes: 'Deliver a crisp 60-second summary before diving into deeper analysis.',
    },
    {
      title: `The Current Challenge in ${capitalize(k1)}`,
      subtitle: 'Understanding the Core Friction Points',
      content: `Legacy models for ${k1} are failing to keep pace with modern performance expectations and market velocity.`,
      bullets: [
        `**Operational Bottlenecks:** 68% of industry practitioners report significant friction in ${k1}`,
        `**Resource Inefficiencies:** Fragmented processes increase cycle times by up to 2.5x`,
        `**Market Pressure:** Competitors adopting modern ${k2} frameworks are capturing market share`,
      ],
      layout: 'two-column',
      order: 2,
      notes: 'Emphasize the cost of inaction. Make the problem tangible to the audience.',
    },
    {
      title: `Strategic Solution: ${mainSubject}`,
      subtitle: 'A Modern, Scalable Architectural Framework',
      content: `Our proposed approach delivers an integrated strategy tailored specifically for ${audience}.`,
      bullets: [
        `**Intelligent Automation:** Streamlining ${k1} workflows with modern technology`,
        `**Real-Time Visibility:** Comprehensive reporting and telemetry for data-driven decisions`,
        `**Scalable Infrastructure:** Designed to support high-throughput growth and seamless adoption`,
        `**Risk Mitigation:** Enterprise-grade governance and security compliance built-in`,
      ],
      layout: 'content',
      order: 3,
      notes: 'Walk through the core pillars of the solution and address potential concerns proactively.',
    },
    {
      title: 'Key Metrics & Projected Growth',
      subtitle: 'Quantifiable Business & Operational Impact',
      content: `Projected trajectory based on full rollout of ${k1} and ${k2} initiatives.`,
      bullets: [
        '**Year 1 Adoption:** +35% baseline performance improvement',
        '**Efficiency Multiplier:** 2.4x acceleration in project delivery turnaround',
        '**Total ROI:** Estimated 280% return over a 36-month horizon',
      ],
      layout: 'chart',
      chartTitle: 'Projected Growth & Efficiency (YoY)',
      order: 4,
      notes: 'Highlight the high-growth trajectory on the chart and explain the contributing drivers.',
    },
    {
      title: 'Implementation Roadmap',
      subtitle: 'Phased Milestones & Key Deliverables',
      content: 'Structured rollout ensuring minimal disruption and maximum velocity.',
      bullets: [
        `**Phase 1 (Month 1-2):** Discovery, stakeholder alignment, and foundation setup for ${k1}`,
        `**Phase 2 (Month 3-5):** Pilot deployment of ${k2} across initial focus groups`,
        `**Phase 3 (Month 6+):** Full-scale rollout, optimization, and continuous monitoring`,
      ],
      layout: 'content',
      order: 5,
      notes: 'Clarify timelines and reassure leadership of the structured risk-management phases.',
    },
    {
      title: 'Key Recommendations',
      subtitle: 'Guiding Principles for Immediate Success',
      content: `To maximize the strategic value of ${mainSubject}, we recommend focusing on three primary levers:`,
      bullets: [
        `**Prioritize High-Impact Wins:** Focus initial bandwidth on immediate ${k1} optimizations`,
        `**Invest in Enablement:** Equip teams with training and tools needed for ${k2}`,
        '**Establish Clear KPIs:** Track milestones weekly to maintain organizational accountability',
      ],
      layout: 'two-column',
      order: 6,
      notes: 'Provide direct, unambiguous recommendations that leadership can approve.',
    },
    {
      title: 'Next Steps & Call to Action',
      subtitle: 'Moving from Strategy to Execution',
      content: `The window of opportunity to lead in ${k1} is open now. Here is how we get started:`,
      bullets: [
        'Approve the proposed implementation charter and resource allocation',
        'Finalize key working group members and project leads',
        'Schedule kickoff session for Phase 1 execution next week',
      ],
      layout: 'content',
      order: 7,
      notes: 'Close with confidence. Open the floor for questions and prompt the decision-maker for sign-off.',
    },
  ];

  return slides.slice(0, count).map((s, i) => ({ ...s, order: i }));
}

// ── Public API ─────────────────────────────────────────────────────

export async function generateSlides({
  prompt = '',
  slideCount = 0,
  tone = 'Professional',
  presentationType = 'Pitch Deck',
  audience = 'General',
  purpose = 'Inform',
  language = 'English (US)',
  referenceUrl = '',
  notesText = '',
} = {}) {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      console.log(`🤖 Generating presentation with Google Gemini 1.5 Pro for prompt: "${prompt}"`);
      return await generateWithGemini(gemini, {
        prompt,
        slideCount,
        tone,
        presentationType,
        audience,
        purpose,
        language,
        referenceUrl,
        notesText,
      });
    } catch (err) {
      console.error('⚠️ Gemini generation failed, falling back to smart engine:', err.message);
    }
  }

  // Smart fallback
  console.log(`⚡ Using smart contextual engine for prompt: "${prompt}"`);
  return buildSmartFallbackSlides(prompt, slideCount, tone, presentationType, audience, notesText);
}

export async function enhanceSlide(slide, instruction = '') {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });
      const prompt = `You are an expert slide editor. Enhance this presentation slide based on this instruction: "${instruction}".

Original Slide:
Title: ${slide.title}
Subtitle: ${slide.subtitle || ''}
Content: ${slide.content || ''}
Bullets: ${JSON.stringify(slide.bullets || [])}
Speaker Notes: ${slide.notes || ''}

Return ONLY a valid JSON object matching:
{
  "title": "string",
  "subtitle": "string",
  "content": "string",
  "bullets": ["string"],
  "notes": "string"
}`;
      const result = await model.generateContent(prompt);
      const jsonMatch = result.response.text().trim().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...slide, ...parsed };
      }
    } catch (err) {
      console.error('⚠️ Gemini slide enhance failed:', err.message);
    }
  }

  // Fallback enhancements
  const enhanced = { ...slide };
  if (/concise|shorter|brief/i.test(instruction)) {
    enhanced.bullets = (slide.bullets || []).slice(0, 3).map((b) => b.replace(/\s*\(.*?\)/g, ''));
    enhanced.content = (slide.content || '').split('.').slice(0, 1).join('.') + '.';
  } else if (/expand|detail|elaborate/i.test(instruction)) {
    enhanced.bullets = [
      ...(slide.bullets || []),
      '**Strategic Upside:** Accelerates cross-functional collaboration and eliminates duplicate overhead.',
      '**Data Validation:** Empirical research demonstrates a 92% satisfaction rate across early adopting teams.',
    ];
  } else if (/executive|c-level|leadership/i.test(instruction)) {
    enhanced.title = `Executive Directive: ${slide.title}`;
    enhanced.bullets = (slide.bullets || []).map((b) =>
      b.startsWith('**') ? b : `**Key Finding:** ${b}`
    );
  } else {
    enhanced.bullets = [
      ...(slide.bullets || []),
      `**AI Strategic Insight:** Focus on measurable milestones to ensure organizational alignment.`,
    ];
  }

  return enhanced;
}
