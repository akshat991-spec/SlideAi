import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * SlideAI Presentation Architect Engine
 *
 * Supports:
 * - Real Google Gemini 1.5 Pro / 3.6 Flash
 * - Full Master Presentation Architect Prompt
 * - High-Resolution Visual Layouts (image-left, image-right, stats/KPIs, charts, timelines, infographics)
 * - Dynamic Photo & Image Generation for Visual Slides
 * - Process Chevrons, Architecture Pillars, Funnel, and 4-Quadrant Infographics
 */

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

// Generate topic-relevant high-resolution image URL
function generateImageUrl(keyword = 'business technology strategy', index = 0) {
  const cleanKeyword = encodeURIComponent(keyword.trim() || 'modern technology');
  return `https://image.pollinations.ai/prompt/${cleanKeyword},professional,photorealistic,clean,cinematic,high quality,4k?width=1200&height=800&nologo=true&seed=${index + 42}`;
}

// ── Master Presentation Architect Prompt Builder ──────────────────

function buildMasterSystemPrompt({
  prompt = '',
  slideCount = 0,
  tone = 'Professional',
  presentationType = 'Pitch Deck',
  audience = 'General',
  purpose = 'Inform',
  language = 'English (US)',
  visualStyle = 'Modern',
  referenceUrl = '',
  notesText = '',
}) {
  const generationMode = slideCount > 0
    ? `${slideCount} Slides (Strict Count)`
    : 'Auto (Determine appropriate slide count based on topic complexity, typically 6 to 8 slides)';

  let fullUserPrompt = prompt.trim();
  if (notesText && notesText.trim()) {
    fullUserPrompt += `\n\n[SOURCE DOCUMENTS & RESEARCH NOTES]:\n${notesText.trim().slice(0, 25000)}`;
  }
  if (referenceUrl && referenceUrl.trim()) {
    fullUserPrompt += `\n\n[REFERENCE SOURCE URL]: ${referenceUrl.trim()}`;
  }

  return `You are an elite presentation architect, visual designer, and business storytelling specialist.

Your task is to create a complete, professional, visually stunning presentation deck based on the request and configuration below.

## PRESENTATION CONFIGURATION
Generation Mode: ${generationMode}
Presentation Type: ${presentationType}
Tone / Style: ${visualStyle} (${tone})
Target Audience: ${audience}
Primary Objective: ${purpose}
Language: ${language} (CRITICAL: Generate ALL slide titles, subtitles, content, bullet points, infographic labels, metrics, and presenter speaker notes ENTIRELY in ${language}!)

## USER'S PRESENTATION REQUEST
${fullUserPrompt}

---

## YOUR OBJECTIVE & NARRATIVE DESIGN
Transform the user's request into an engaging, executive-level presentation.
Design with diverse visual layouts & infographics:
- Slide 1: "title" (Hero cover slide)
- Slide 2: "image-right" or "two-column" (Problem / Context with relevant photography)
- Slide 3: "infographic" (Architecture Pillars or Process Workflow)
- Slide 4: "chart" or "stats" (Quantitative Impact, KPIs, or Growth Trends)
- Slide 5: "timeline" or "two-column" (Roadmap, Phased Milestones, or Comparison)
- Slide 6+: "image-left" or "content" (Strategic Advantage, Call to Action, Conclusion)

---

## CONTENT, VISUAL & INFOGRAPHIC RULES
* Every slide must have a distinct purpose and strong, informative title.
* Use concise bullet points with **bold headers** (e.g. "**Operational Bottleneck:** ...").
* For "image-left" or "image-right" slides, provide a descriptive "imagePrompt" (e.g. "photorealistic robotic surgery in clean modern hospital operating room").
* For "infographic" slides:
  - Set "infographicType": "pillars" | "process" | "funnel" | "matrix"
  - Provide "infographicData": Array of 3 to 4 items with { "step": 1, "title": "Pillar Name", "description": "Crisp 1-sentence detail", "value": "e.g. 99.9% or Step 1" }
* For "stats" slides, provide a "metrics" array with 2-3 high-impact numbers (e.g. [{"label": "Efficiency Gain", "value": "+45%"}, {"label": "Cost Savings", "value": "$2.4M"}]).
* For "chart" slides, provide "chartTitle", "chartLabels", and "chartValues" (e.g. labels: ["Q1", "Q2", "Q3", "Q4"], values: [35, 55, 78, 100]).

---

## OUTPUT FORMAT SPECIFICATION (CRITICAL)
Return ONLY a valid, parseable JSON array of slide objects. Do not include markdown code fences (\`\`\`json), explanations, or preamble.

Structure each slide object as follows:
[
  {
    "title": "Strong, Meaningful Slide Title",
    "subtitle": "Informative Subtitle Communicating Core Context",
    "content": "Concise 1-2 sentence executive overview.",
    "bullets": [
      "**Primary Takeaway:** Specific data point, insight, or evidence",
      "**Supporting Driver:** Mechanism, proof point, or strategic nuance"
    ],
    "layout": "title" | "content" | "image-right" | "image-left" | "two-column" | "chart" | "stats" | "timeline" | "infographic",
    "infographicType": "pillars" | "process" | "funnel" | "matrix" | "none",
    "infographicData": [
      { "step": 1, "title": "Smart Telemetry", "description": "Real-time edge telemetry with sub-millisecond sync.", "value": "01" },
      { "step": 2, "title": "Autonomous Routing", "description": "Dynamic path optimization reducing latency.", "value": "02" },
      { "step": 3, "title": "Zero-Trust Security", "description": "End-to-end hardware-level cryptographic isolation.", "value": "03" }
    ],
    "imagePrompt": "Detailed visual description for generating a relevant photo",
    "chartTitle": "Optional title for chart",
    "chartLabels": ["Q1", "Q2", "Q3", "Q4"],
    "chartValues": [40, 65, 85, 110],
    "metrics": [
      { "label": "Performance Leap", "value": "10x" },
      { "label": "Cost Reduction", "value": "45%" }
    ],
    "notes": "Comprehensive presenter speaker notes explaining context, talking points, and delivery tips."
  }
]`;
}

// ── Real Gemini AI Generation ──────────────────────────────────────

async function generateWithGemini(gemini, config) {
  const modelsToTry = [
    process.env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.1-pro-preview',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ].filter(Boolean);

  const systemPrompt = buildMasterSystemPrompt(config);
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting presentation generation with ${modelName}...`);
      const model = gemini.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text().trim();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error(`Model ${modelName} did not return a valid JSON array`);
      }

      const rawSlides = JSON.parse(jsonMatch[0]);
      return rawSlides.map((s, i) => {
        const layout = s.layout || (i === 0 ? 'title' : 'content');
        const imagePrompt = s.imagePrompt || s.title || config.prompt;
        const imageUrl = ['image-left', 'image-right', 'title'].includes(layout)
          ? generateImageUrl(imagePrompt, i)
          : '';

        return {
          title: s.title || `Slide ${i + 1}`,
          subtitle: s.subtitle || '',
          content: s.content || '',
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
          layout,
          imageUrl,
          imagePrompt,
          infographicType: s.infographicType || (layout === 'infographic' ? 'pillars' : 'none'),
          infographicData: Array.isArray(s.infographicData) && s.infographicData.length > 0
            ? s.infographicData
            : [
                { step: 1, title: 'Intelligent Ingestion', description: 'Real-time telemetry and data synthesis.', value: '01' },
                { step: 2, title: 'Adaptive Core', description: 'Autonomous optimization with continuous feedback.', value: '02' },
                { step: 3, title: 'Enterprise Scaling', description: 'Zero-downtime distributed deployment.', value: '03' },
              ],
          chartTitle: s.chartTitle || '',
          chartLabels: Array.isArray(s.chartLabels) && s.chartLabels.length > 0 ? s.chartLabels : ['Q1', 'Q2', 'Q3', 'Q4'],
          chartValues: Array.isArray(s.chartValues) && s.chartValues.length > 0 ? s.chartValues : [35, 55, 78, 100],
          metrics: Array.isArray(s.metrics) && s.metrics.length > 0 ? s.metrics : [
            { label: 'Projected Impact', value: '+45%' },
            { label: 'Time Saved', value: '2.5x' }
          ],
          notes: s.notes || '',
          order: i,
        };
      });
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} failed: ${err.message}. Trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
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

  const count = slideCount > 0 ? slideCount : 6;

  const slides = [
    {
      title: mainSubject,
      subtitle: `${presentationType} for ${audience} • ${new Date().getFullYear()}`,
      content: `A strategic presentation focused on ${prompt}. Designed to inform, align, and drive key decisions.`,
      bullets: [],
      layout: 'title',
      imageUrl: generateImageUrl(mainSubject + ' banner header', 0),
      order: 0,
      notes: `Welcome everyone. Introduce the session on "${prompt}" and outline key expectations.`,
    },
    {
      title: `The Current Challenge in ${capitalize(k1)}`,
      subtitle: 'Understanding the Core Friction Points',
      content: `Legacy models for ${k1} are failing to keep pace with modern performance expectations and market velocity.`,
      bullets: [
        `**Operational Bottlenecks:** 68% of practitioners report significant friction in ${k1}`,
        `**Resource Inefficiencies:** Fragmented processes increase cycle times by up to 2.5x`,
        `**Market Pressure:** Competitors adopting modern ${k2} frameworks are capturing market share`,
      ],
      layout: 'image-right',
      imageUrl: generateImageUrl(k1 + ' problem challenge technology', 1),
      order: 1,
      notes: 'Emphasize the cost of inaction. Make the problem tangible to the audience.',
    },
    {
      title: `Strategic Architecture Pillars`,
      subtitle: `Core Functional Dimensions of ${mainSubject}`,
      content: `Our proposed framework delivers an integrated, scalable model designed for high-velocity execution.`,
      bullets: [],
      layout: 'infographic',
      infographicType: 'pillars',
      infographicData: [
        { step: 1, title: `Intelligent ${capitalize(k1)}`, description: `Automated workflows reducing manual friction by up to 60%.`, value: 'Pillar 01' },
        { step: 2, title: `Real-Time ${capitalize(k2)}`, description: `Unified reporting telemetry with predictive risk stratification.`, value: 'Pillar 02' },
        { step: 3, title: `Scalable ${capitalize(k3)}`, description: `Modular enterprise integration designed for zero-disruption rollout.`, value: 'Pillar 03' },
      ],
      order: 2,
      notes: 'Walk through each architectural pillar to demonstrate systematic execution.',
    },
    {
      title: 'Key Metrics & Projected Impact',
      subtitle: 'Quantifiable Business & Operational Returns',
      content: `Projected trajectory based on full rollout of ${k1} and ${k2} initiatives.`,
      bullets: [
        '**Year 1 Efficiency Gain:** +45% acceleration across core workflows',
        '**Cost Optimization:** Estimated $2.4M saved in operational overhead annually',
      ],
      layout: 'stats',
      metrics: [
        { label: 'Workflow Velocity', value: '+45%' },
        { label: 'Annual Savings', value: '$2.4M' },
        { label: 'Satisfaction Score', value: '98%' },
      ],
      order: 3,
      notes: 'Highlight the prominent metric cards and walk through the underlying drivers.',
    },
    {
      title: 'Performance & Growth Trajectory',
      subtitle: 'Year-over-Year Scaling and Adoption Rates',
      content: 'Consistent quarter-over-quarter expansion driven by strategic deployment.',
      bullets: [
        '**Rapid Ramp-up:** Q1-Q2 baseline established across initial focus groups',
        '**Compounding Return:** 280% cumulative ROI projected across 36 months',
      ],
      layout: 'chart',
      chartTitle: 'Adoption & Growth Trajectory (YoY)',
      chartLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
      chartValues: [35, 60, 85, 115],
      order: 4,
      notes: 'Explain the high-growth trajectory on the chart and answer any financial inquiries.',
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
      layout: 'timeline',
      order: 5,
      notes: 'Clarify timelines and reassure leadership of the structured risk-management phases.',
    },
  ];

  return slides.slice(0, count).map((s, i) => ({ ...s, order: i }));
}

// ── Public API ─────────────────────────────────────────────────────

export async function generateSlides(config = {}) {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      return await generateWithGemini(gemini, config);
    } catch (err) {
      console.error('⚠️ Gemini generation failed, falling back to smart engine:', err.message);
    }
  }

  const {
    prompt = '',
    slideCount = 0,
    tone = 'Professional',
    presentationType = 'Pitch Deck',
    audience = 'General',
    notesText = '',
  } = config;

  console.log(`⚡ Using smart contextual engine for prompt: "${prompt}"`);
  return buildSmartFallbackSlides(prompt, slideCount, tone, presentationType, audience, notesText);
}

export async function enhanceSlide(slide, instruction = '') {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });
      const prompt = `You are an expert slide editor and visual presentation architect. Enhance this presentation slide based on this instruction: "${instruction}".

Original Slide:
Title: ${slide.title}
Subtitle: ${slide.subtitle || ''}
Content: ${slide.content || ''}
Bullets: ${JSON.stringify(slide.bullets || [])}
Layout: ${slide.layout || 'content'}
Speaker Notes: ${slide.notes || ''}

Return ONLY a valid JSON object matching:
{
  "title": "string",
  "subtitle": "string",
  "content": "string",
  "bullets": ["string"],
  "imagePrompt": "string",
  "notes": "string"
}`;
      const result = await model.generateContent(prompt);
      const jsonMatch = result.response.text().trim().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.imagePrompt) {
          parsed.imageUrl = generateImageUrl(parsed.imagePrompt, slide.order || 0);
        }
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
