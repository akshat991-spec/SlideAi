import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildMasterSystemPrompt() {
  return `You are an elite presentation architect, visual designer, and business storytelling specialist.

Your task is to create a complete, professional, visually stunning presentation deck based on the request and configuration below.

## PRESENTATION CONFIGURATION
Generation Mode: Auto (Determine appropriate slide count based on topic complexity, typically 6 to 8 slides)
Presentation Type: Pitch Deck
Tone / Style: Modern (Professional)
Target Audience: General
Primary Objective: Inform
Language: Hindi (हिन्दी) (CRITICAL: Generate ALL slide titles, subtitles, content, bullet points, infographic labels, metrics, and presenter speaker notes ENTIRELY in Hindi (हिन्दी)!)

## USER'S PRESENTATION REQUEST
A presentation about space exploration

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

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(buildMasterSystemPrompt());
    console.log(result.response.text());
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
