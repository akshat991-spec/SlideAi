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
Language: ${language}

## CRITICAL LANGUAGE & JSON ENUM RULES:
1. ALL human-facing text ("title", "subtitle", "content", "bullets", "notes", infographic "title" and "description", metric "label") MUST be written completely and naturally in ${language}.
2. ALL JSON keys and structural enum values MUST REMAIN IN ENGLISH.
   - For "layout", use ONLY one of: "title", "content", "image-right", "image-left", "two-column", "chart", "stats", "timeline", "infographic". DO NOT translate layout names.
   - For "infographicType", use ONLY one of: "pillars", "process", "funnel", "matrix", "none".
   - For "chartValues", use standard ASCII numbers (e.g. [35, 55, 78, 100]), never translated numerals or symbols.
   - For "step", use standard integers (1, 2, 3, 4).

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

function toAsciiNumber(val, fallback = 0) {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  // Convert Hindi/Devanagari numerals ०-९ (0x0966-0x096F) to standard 0-9
  const converted = String(val).replace(/[\u0966-\u096F]/g, (d) => d.charCodeAt(0) - 0x0966);
  const num = parseFloat(converted.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? fallback : num;
}

const VALID_LAYOUTS = new Set([
  'title', 'content', 'two-column', 'image-left', 'image-right',
  'chart', 'stats', 'timeline', 'infographic', 'blank'
]);

function normalizeLayout(rawLayout, defaultLayout = 'content') {
  if (!rawLayout || typeof rawLayout !== 'string') return defaultLayout;
  const l = rawLayout.toLowerCase().trim();
  if (VALID_LAYOUTS.has(l)) return l;
  if (l.includes('title') || l.includes('hero') || l.includes('cover') || l.includes('शीर्षक')) return 'title';
  if (l.includes('chart') || l.includes('graph') || l.includes('ग्राफ') || l.includes('ग्राफ़')) return 'chart';
  if (l.includes('stat') || l.includes('metric') || l.includes('kpi') || l.includes('आंकड़े') || l.includes('संख्या')) return 'stats';
  if (l.includes('time') || l.includes('road') || l.includes('समय') || l.includes('रोडमैप')) return 'timeline';
  if (l.includes('info') || l.includes('pillar') || l.includes('process') || l.includes('स्तंभ') || l.includes('प्रक्रिया')) return 'infographic';
  if (l.includes('two') || l.includes('col') || l.includes('दो') || l.includes('कॉलम')) return 'two-column';
  if (l.includes('image') || l.includes('चित्र') || l.includes('फोटो')) {
    return (l.includes('left') || l.includes('बाएं') || l.includes('बाएँ')) ? 'image-left' : 'image-right';
  }
  return defaultLayout;
}

const VALID_INFOGRAPHICS = new Set(['process', 'funnel', 'matrix', 'pillars', 'none']);

function normalizeInfographicType(rawType, layout) {
  if (!rawType || typeof rawType !== 'string') return layout === 'infographic' ? 'pillars' : 'none';
  const t = rawType.toLowerCase().trim();
  if (VALID_INFOGRAPHICS.has(t)) return t;
  if (t.includes('process') || t.includes('प्रक्रिया') || t.includes('चरण')) return 'process';
  if (t.includes('funnel') || t.includes('फ़नल') || t.includes('फनल')) return 'funnel';
  if (t.includes('matrix') || t.includes('मैट्रिक्स')) return 'matrix';
  if (t.includes('pillar') || t.includes('स्तंभ') || t.includes('खंभा')) return 'pillars';
  return layout === 'infographic' ? 'pillars' : 'none';
}

async function generateWithGemini(gemini, config) {
  const modelsToTry = [
    process.env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.1-pro-preview',
  ].filter(Boolean);

  const systemPrompt = buildMasterSystemPrompt(config);
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting presentation generation with ${modelName}...`);
      const model = gemini.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error(`Model ${modelName} did not return a valid JSON array`);
      }

      let cleanJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
      const rawSlides = JSON.parse(cleanJson);
      return rawSlides.map((s, i) => {
        const layout = normalizeLayout(s.layout, i === 0 ? 'title' : 'content');
        const imagePrompt = s.imagePrompt || s.title || config.prompt;
        const imageUrl = ['image-left', 'image-right', 'title'].includes(layout)
          ? generateImageUrl(imagePrompt, i)
          : '';

        const infographicType = normalizeInfographicType(s.infographicType, layout);
        const infographicData = Array.isArray(s.infographicData) && s.infographicData.length > 0
          ? s.infographicData.map((item, idx) => ({
              step: toAsciiNumber(item.step, idx + 1),
              title: String(item.title || `बिंदु ${idx + 1}`),
              description: String(item.description || ''),
              value: String(item.value || `0${idx + 1}`),
            }))
          : [
              { step: 1, title: 'रणनीतिक योजना', description: 'प्राथमिक विश्लेषण और डेटा एकत्रीकरण।', value: '01' },
              { step: 2, title: 'प्रक्रिया कार्यान्वयन', description: 'समयबद्ध और कुशल क्रियान्वयन प्रणाली।', value: '02' },
              { step: 3, title: 'दीर्घकालिक प्रभाव', description: 'सतत विकास और मापनीय सफलता।', value: '03' },
            ];

        const chartValues = Array.isArray(s.chartValues) && s.chartValues.length > 0
          ? s.chartValues.map((v) => toAsciiNumber(v, 50))
          : [35, 55, 78, 100];

        const metrics = Array.isArray(s.metrics) && s.metrics.length > 0
          ? s.metrics.map((m) => ({
              label: String(m.label || 'प्रमुख मीट्रिक'),
              value: String(m.value || '100%'),
            }))
          : [
              { label: 'प्रभाव', value: '+45%' },
              { label: 'दक्षता', value: '2.5x' },
            ];

        return {
          title: String(s.title || `Slide ${i + 1}`),
          subtitle: String(s.subtitle || ''),
          content: String(s.content || ''),
          bullets: Array.isArray(s.bullets) ? s.bullets.map(String) : [],
          layout,
          imageUrl,
          imagePrompt: String(imagePrompt),
          infographicType,
          infographicData,
          chartTitle: String(s.chartTitle || ''),
          chartLabels: Array.isArray(s.chartLabels) && s.chartLabels.length > 0 ? s.chartLabels.map(String) : ['Q1', 'Q2', 'Q3', 'Q4'],
          chartValues,
          metrics,
          notes: String(s.notes || ''),
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

function buildHindiFallbackSlides(prompt, slideCount, presentationType, audience) {
  const count = slideCount > 0 ? slideCount : 5;
  const p = prompt.trim() || 'पर्यावरण और प्रकृति संरक्षण';
  const slides = [
    {
      title: `${p}: एक व्यापक रणनीतिक दृष्टिकोण`,
      subtitle: `${presentationType} • ${audience} के लिए • ${new Date().getFullYear()}`,
      content: `यह प्रस्तुति "${p}" के महत्वपूर्ण पहलुओं, चुनौतियों और रणनीतिक समाधानों पर केंद्रित है।`,
      bullets: [],
      layout: 'title',
      imageUrl: generateImageUrl(p + ' green nature', 0),
      order: 0,
      notes: `सभी का स्वागत है। आज हम "${p}" पर विस्तार से चर्चा करेंगे और प्रमुख बिंदुओं को समझेंगे।`,
    },
    {
      title: 'वर्तमान स्थिति और मुख्य चुनौतियां',
      subtitle: 'समस्याओं की गहराई और उनका प्रभाव',
      content: 'वर्तमान समय में पारंपरिक प्रणालियां बढ़ती मांगों और पर्यावरणीय दबावों का सामना करने में असमर्थ हैं।',
      bullets: [
        '**गंभीर असंतुलन:** संसाधनों का अनियंत्रित उपयोग और प्रक्रियागत जटिलताएं संकट को बढ़ा रही हैं',
        '**दक्षता की कमी:** पुरानी रणनीतियों में 65% तक अधिक समय और संसाधन खर्च होते हैं',
        '**तत्काल आवश्यकता:** नवाचार और आधुनिक तकनीकों को अपनाना अब अनिवार्य हो चुका है',
      ],
      layout: 'image-right',
      imageUrl: generateImageUrl(p + ' challenge problem', 1),
      order: 1,
      notes: 'इस स्लाइड पर मुख्य संकट और निष्क्रियता के परिणामों पर बल दें।',
    },
    {
      title: 'रणनीतिक समाधान के तीन मुख्य स्तंभ',
      subtitle: 'संरचनात्मक ढांचा और कार्यप्रणाली',
      content: 'हमारा एकीकृत ढांचा समयबद्ध और उच्च प्रभाव वाले परिणामों के लिए डिज़ाइन किया गया है।',
      bullets: [],
      layout: 'infographic',
      infographicType: 'pillars',
      infographicData: [
        { step: 1, title: 'जागरूकता व संरक्षण', description: 'व्यापक स्तर पर जनजागरण और सक्रिय सामुदायिक भागीदारी।', value: 'स्तंभ ०१' },
        { step: 2, title: 'सस्टेनेबल तकनीक', description: 'पर्यावरण-अनुकूल और ऊर्जा-कुशल तकनीकों का त्वरित उपयोग।', value: 'स्तंभ ०२' },
        { step: 3, title: 'नीतिगत क्रियान्वयन', description: 'मजबूत निगरानी, जवाबदेही और सतत परिणाम सुनिश्चित करना।', value: 'स्तंभ ०३' },
      ],
      order: 2,
      notes: 'तीनों प्रमुख स्तंभों का वर्णन करें ताकि योजना की स्पष्टता स्थापित हो सके।',
    },
    {
      title: 'प्रमुख मैट्रिक्स और अपेक्षित प्रभाव',
      subtitle: 'मापने योग्य सुधार और सांख्यिकी',
      content: 'प्रस्तावित कार्ययोजना के क्रियान्वयन के बाद अनुमानित सकारात्मक परिवर्तन।',
      bullets: [
        '**कार्यकुशलता में सुधार:** प्राथमिक लक्ष्यों में 45% तक की तीव्र प्रगति',
        '**संसाधन बचत:** परिचालन लागत में महत्वपूर्ण कटौती और उच्च प्रतिफल',
      ],
      layout: 'stats',
      metrics: [
        { label: 'सकारात्मक प्रभाव', value: '+45%' },
        { label: 'संसाधन दक्षता', value: '3x' },
        { label: 'भागीदारी दर', value: '95%' },
      ],
      order: 3,
      notes: 'संख्यात्मक आंकड़ों पर ध्यान केंद्रित करें और उनकी प्रामाणिकता समझाएं।',
    },
    {
      title: 'क्रियान्वयन रोडमैप और मील के पत्थर',
      subtitle: 'चरणबद्ध योजना और रणनीतिक कदम',
      content: 'न्यूनतम व्यवधान और अधिकतम गति सुनिश्चित करने के लिए संरचित चरण।',
      bullets: [
        '**चरण १ (माह १-२):** आधारभूत विश्लेषण, संसाधन आवंटन और प्रारंभिक योजना',
        '**चरण २ (माह ३-५):** पायलट प्रोजेक्ट का शुभारंभ और प्रारंभिक मूल्यांकन',
        '**चरण ३ (माह ६+):** पूर्ण पैमाने पर कार्यान्वयन और सतत निगरानी',
      ],
      layout: 'timeline',
      order: 4,
      notes: 'समय-सीमा स्पष्ट करें और नेतृत्व को विश्वास दिलाएं।',
    },
  ];

  return slides.slice(0, count).map((s, i) => ({ ...s, order: i }));
}

function buildSmartFallbackSlides(prompt, slideCount, tone, presentationType, audience, notesText = '', language = 'English (US)') {
  const isHindi = /hindi|हिन्दी|hinglish/i.test(language);
  if (isHindi) {
    return buildHindiFallbackSlides(prompt, slideCount, presentationType, audience);
  }

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
      console.error('⚠️ Gemini generation failed, falling back to smart contextual engine:', err.message);
    }
  }

  const {
    prompt = '',
    slideCount = 0,
    tone = 'Professional',
    presentationType = 'Pitch Deck',
    audience = 'General',
    notesText = '',
    language = 'English (US)',
  } = config;

  console.log(`⚡ Using smart contextual engine for prompt: "${prompt}" (language: ${language})`);
  return buildSmartFallbackSlides(prompt, slideCount, tone, presentationType, audience, notesText, language);
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
