import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

/**
 * SlideAI Professional PowerPoint (.pptx) Generator
 *
 * Implements a modern executive design system with:
 * - 16:9 Widescreen slide dimensions
 * - Curated brand palettes (Indigo, Blue, Emerald, Slate)
 * - Structured component layouts: Hero Title, Infographics (Pillars & Process), Image-Right/Left, Stats/KPIs, Charts, Timelines, Two-Column
 * - Speaker notes embedded natively in every PowerPoint slide
 */

const THEME_PALETTES = {
  indigo: {
    bg: 'F8FAFC',
    cardBg: 'FFFFFF',
    primary: '4338CA',
    secondary: '6366F1',
    textDark: '0F172A',
    textMuted: '475569',
    accent: '4F46E5',
    border: 'E2E8F0',
    chartFill: ['4338CA', '6366F1', '818CF8', 'C7D2FE'],
  },
  blue: {
    bg: 'F0F9FF',
    cardBg: 'FFFFFF',
    primary: '0284C7',
    secondary: '38BDF8',
    textDark: '0C4A6E',
    textMuted: '475569',
    accent: '0EA5E9',
    border: 'E0F2FE',
    chartFill: ['0284C7', '0EA5E9', '38BDF8', 'BAE6FD'],
  },
  emerald: {
    bg: 'F0FDF4',
    cardBg: 'FFFFFF',
    primary: '059669',
    secondary: '34D399',
    textDark: '064E3B',
    textMuted: '475569',
    accent: '10B981',
    border: 'DCFCE7',
    chartFill: ['059669', '10B981', '34D399', 'A7F3D0'],
  },
  slate: {
    bg: 'F8FAFC',
    cardBg: 'FFFFFF',
    primary: '334155',
    secondary: '64748B',
    textDark: '0F172A',
    textMuted: '475569',
    accent: '475569',
    border: 'E2E8F0',
    chartFill: ['334155', '475569', '64748B', 'CBD5E1'],
  },
};

function getPalette(themeName = 'indigo') {
  return THEME_PALETTES[themeName] || THEME_PALETTES.indigo;
}

/**
 * Returns the best-fit PowerPoint font for the given language string.
 * Devanagari (Hindi, Marathi, Hinglish) needs Noto Sans Devanagari;
 * other Indic/CJK scripts each need their own Unicode font.
 */
function getFont(language = 'English (US)') {
  const lang = (language || '').toLowerCase();

  // Devanagari: Hindi, Marathi, Nepali, Hinglish
  if (lang.includes('hindi') || lang.includes('\u0939\u093f\u0928\u094d\u0926\u0940') ||
      lang.includes('marathi') || lang.includes('\u092e\u0930\u093e\u0920\u0940') ||
      lang.includes('hinglish')) {
    return 'Noto Sans Devanagari';
  }
  // Bengali
  if (lang.includes('bengali') || lang.includes('\u09ac\u09be\u0982\u09b2\u09be')) {
    return 'Noto Sans Bengali';
  }
  // Tamil
  if (lang.includes('tamil') || lang.includes('\u0ba4\u0bae\u0bbf\u0bb4\u0bcd')) {
    return 'Noto Sans Tamil';
  }
  // Telugu
  if (lang.includes('telugu') || lang.includes('\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41')) {
    return 'Noto Sans Telugu';
  }
  // Gujarati
  if (lang.includes('gujarati') || lang.includes('\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0')) {
    return 'Noto Sans Gujarati';
  }
  // Arabic
  if (lang.includes('arabic') || lang.includes('\u0627\u0644\u0639\u0631\u0628\u064a\u0629')) {
    return 'Arial Unicode MS';
  }
  // Japanese
  if (lang.includes('japanese') || lang.includes('\u65e5\u672c\u8a9e')) {
    return 'MS Gothic';
  }
  // Chinese / Mandarin
  if (lang.includes('chinese') || lang.includes('mandarin')) {
    return 'Microsoft YaHei';
  }
  // Korean
  if (lang.includes('korean') || lang.includes('\ud55c\uad6d\uc5b4')) {
    return 'Malgun Gothic';
  }

  // Latin-based and all others
  return 'Arial';
}

// ── Slide Creators ─────────────────────────────────────────────────

/**
 * 1. Title / Hero Slide
 */
function renderTitleSlide(pptx, slideData, palette, presentationMeta, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: palette.primary },
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.0,
    y: 1.2,
    w: 11.33,
    h: 5.0,
    rectRadius: 0.2,
    fill: { color: palette.cardBg },
    line: { color: palette.border, width: 1 },
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 1.0,
    y: 1.2,
    w: 0.2,
    h: 5.0,
    fill: { color: palette.accent },
  });

  const tagText = (presentationMeta.presentationType || 'PRESENTATION').toUpperCase();
  slide.addText(tagText, {
    x: 1.6,
    y: 1.6,
    w: 9.0,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: palette.accent,
    fontFace: 'Arial',
  });

  slide.addText(slideData.title || presentationMeta.title || 'Untitled Presentation', {
    x: 1.6,
    y: 2.1,
    w: 10.0,
    h: 1.6,
    fontSize: 32,
    bold: true,
    color: palette.textDark,
    fontFace: font,
    valign: 'top',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 1.6,
      y: 3.8,
      w: 10.0,
      h: 0.8,
      fontSize: 15,
      color: palette.textMuted,
      fontFace: font,
    });
  }

  const footerText = `${presentationMeta.audience ? `Audience: ${presentationMeta.audience}  •  ` : ''}${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  slide.addText(footerText, {
    x: 1.6,
    y: 5.4,
    w: 10.0,
    h: 0.4,
    fontSize: 10,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

/**
 * 2. Infographic Slide (Pillars & Process)
 */
function renderInfographicSlide(pptx, slideData, palette, index, total, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: palette.primary },
  });

  slide.addText(slideData.title || `Strategic Framework`, {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: palette.textDark,
    fontFace: font,
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: font,
    });
  }

  const items = slideData.infographicData?.length
    ? slideData.infographicData
    : [
        { step: 1, title: 'Intelligent Ingestion', description: 'Real-time telemetry and edge data synthesis.', value: 'Pillar 01' },
        { step: 2, title: 'Adaptive Core', description: 'Autonomous optimization with continuous feedback.', value: 'Pillar 02' },
        { step: 3, title: 'Enterprise Scaling', description: 'Zero-downtime distributed deployment architecture.', value: 'Pillar 03' },
      ];

  const count = Math.min(items.length, 4);
  const totalW = 11.73;
  const gap = 0.35;
  const cardW = (totalW - gap * (count - 1)) / count;

  items.slice(0, count).forEach((item, i) => {
    const cardX = 0.8 + i * (cardW + gap);

    // Main Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: cardW,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: palette.cardBg },
      line: { color: palette.border, width: 1 },
    });

    // Top Accent Stripe
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: cardW,
      h: 0.12,
      fill: { color: palette.accent },
    });

    // Badge
    slide.addText(item.value || `0${i + 1}`, {
      x: cardX + 0.2,
      y: 2.1,
      w: 1.2,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: palette.primary,
      fill: { color: 'F1F5F9' },
      align: 'center',
      fontFace: 'Arial',
    });

    // Title
    slide.addText(item.title || `Dimension ${i + 1}`, {
      x: cardX + 0.2,
      y: 2.6,
      w: cardW - 0.4,
      h: 0.8,
      fontSize: 13,
      bold: true,
      color: palette.textDark,
      fontFace: font,
      valign: 'top',
    });

    // Description
    slide.addText(item.description || 'Core strategic component delivering measurable outcomes.', {
      x: cardX + 0.2,
      y: 3.4,
      w: cardW - 0.4,
      h: 2.8,
      fontSize: 11,
      color: palette.textMuted,
      fontFace: font,
      valign: 'top',
    });
  });

  slide.addText(`${index + 1} / ${total}`, {
    x: 11.5,
    y: 7.0,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8',
    align: 'right',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

/**
 * 3. Image-Right Slide
 */
function renderImageRightSlide(pptx, slideData, palette, index, total, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: palette.primary },
  });

  slide.addText(slideData.title || `Slide ${index + 1}`, {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: palette.textDark,
    fontFace: font,
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: font,
    });
  }

  const leftW = 6.8;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.7,
    w: leftW,
    h: 5.0,
    rectRadius: 0.12,
    fill: { color: palette.cardBg },
    line: { color: palette.border, width: 1 },
  });

  const bullets = (slideData.bullets || []).filter((b) => b && b.trim());
  const bulletItems = bullets.map((b) => ({ text: `• ${b.replace(/^[-•*]\s*/, '')}\n\n`, options: { fontSize: 11, color: palette.textDark } }));

  slide.addText(
    slideData.content
      ? [{ text: `${slideData.content}\n\n`, options: { fontSize: 12, bold: true, color: palette.accent } }, ...bulletItems]
      : bulletItems,
    {
      x: 1.1,
      y: 2.0,
      w: leftW - 0.6,
      h: 4.4,
      fontFace: font,
      valign: 'top',
    }
  );

  const rightX = 7.9;
  const rightW = 4.6;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: rightX,
    y: 1.7,
    w: rightW,
    h: 5.0,
    rectRadius: 0.15,
    fill: { color: 'E2E8F0' },
    line: { color: palette.border, width: 1 },
  });

  if (slideData.imageUrl) {
    try {
      slide.addImage({
        path: slideData.imageUrl,
        x: rightX,
        y: 1.7,
        w: rightW,
        h: 5.0,
        rounding: true,
      });
    } catch {
      // Fallback
    }
  }

  slide.addText(`${index + 1} / ${total}`, {
    x: 11.5,
    y: 7.0,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8',
    align: 'right',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

/**
 * 4. Image-Left Slide
 */
function renderImageLeftSlide(pptx, slideData, palette, index, total, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: palette.primary },
  });

  slide.addText(slideData.title || `Slide ${index + 1}`, {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: palette.textDark,
    fontFace: font,
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: font,
    });
  }

  const leftX = 0.8;
  const leftW = 4.6;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: leftX,
    y: 1.7,
    w: leftW,
    h: 5.0,
    rectRadius: 0.15,
    fill: { color: 'E2E8F0' },
    line: { color: palette.border, width: 1 },
  });

  if (slideData.imageUrl) {
    try {
      slide.addImage({
        path: slideData.imageUrl,
        x: leftX,
        y: 1.7,
        w: leftW,
        h: 5.0,
        rounding: true,
      });
    } catch {
      // Fallback
    }
  }

  const rightX = 5.7;
  const rightW = 6.8;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: rightX,
    y: 1.7,
    w: rightW,
    h: 5.0,
    rectRadius: 0.12,
    fill: { color: palette.cardBg },
    line: { color: palette.border, width: 1 },
  });

  const bullets = (slideData.bullets || []).filter((b) => b && b.trim());
  const bulletItems = bullets.map((b) => ({ text: `• ${b.replace(/^[-•*]\s*/, '')}\n\n`, options: { fontSize: 11, color: palette.textDark } }));

  slide.addText(
    slideData.content
      ? [{ text: `${slideData.content}\n\n`, options: { fontSize: 12, bold: true, color: palette.accent } }, ...bulletItems]
      : bulletItems,
    {
      x: rightX + 0.3,
      y: 2.0,
      w: rightW - 0.6,
      h: 4.4,
      fontFace: font,
      valign: 'top',
    }
  );

  slide.addText(`${index + 1} / ${total}`, {
    x: 11.5,
    y: 7.0,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8',
    align: 'right',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

/**
 * 5. Stats / KPI Slide
 */
function renderStatsSlide(pptx, slideData, palette, index, total, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: palette.primary },
  });

  slide.addText(slideData.title || `Key Metrics & Impact`, {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: palette.textDark,
    fontFace: font,
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: font,
    });
  }

  const metrics = slideData.metrics?.length ? slideData.metrics : [
    { label: 'Efficiency Gain', value: '+45%' },
    { label: 'Annual Overhead Saved', value: '$2.4M' },
    { label: 'User Satisfaction', value: '98%' },
  ];

  const cardW = 3.65;
  metrics.slice(0, 3).forEach((m, i) => {
    const cardX = 0.8 + i * (cardW + 0.38);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: cardW,
      h: 2.8,
      rectRadius: 0.15,
      fill: { color: palette.cardBg },
      line: { color: palette.border, width: 1 },
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: cardX,
      y: 1.8,
      w: cardW,
      h: 0.1,
      fill: { color: palette.accent },
    });

    slide.addText(m.value || '100%', {
      x: cardX,
      y: 2.3,
      w: cardW,
      h: 1.0,
      fontSize: 36,
      bold: true,
      color: palette.accent,
      align: 'center',
      fontFace: 'Arial',
    });

    slide.addText(m.label || 'Key Metric', {
      x: cardX + 0.2,
      y: 3.4,
      w: cardW - 0.4,
      h: 0.8,
      fontSize: 12,
      color: palette.textDark,
      align: 'center',
      fontFace: font,
    });
  });

  const bullets = (slideData.bullets || []).filter((b) => b && b.trim());
  if (bullets.length > 0) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 4.9,
      w: 11.73,
      h: 1.8,
      rectRadius: 0.1,
      fill: { color: palette.cardBg },
      line: { color: palette.border, width: 1 },
    });

    slide.addText(bullets.map((b) => ({ text: `• ${b.replace(/^[-•*]\s*/, '')}\n`, options: { fontSize: 11, color: palette.textDark } })), {
      x: 1.1,
      y: 5.1,
      w: 11.1,
      h: 1.4,
      fontFace: font,
      valign: 'top',
    });
  }

  slide.addText(`${index + 1} / ${total}`, {
    x: 11.5,
    y: 7.0,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8',
    align: 'right',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

/**
 * 6. Chart Slide
 */
function renderChartSlide(pptx, slideData, palette, index, total, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: palette.primary },
  });

  slide.addText(slideData.title || `Data Insights`, {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: palette.textDark,
    fontFace: font,
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: font,
    });
  }

  const leftW = 5.4;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.8,
    w: leftW,
    h: 4.8,
    rectRadius: 0.12,
    fill: { color: palette.cardBg },
    line: { color: palette.border, width: 1 },
  });

  const bullets = (slideData.bullets || []).filter((b) => b && b.trim());
  slide.addText(bullets.map((b) => ({ text: `• ${b.replace(/^[-•*]\s*/, '')}\n\n`, options: { fontSize: 11, color: palette.textDark } })), {
    x: 1.1,
    y: 2.1,
    w: leftW - 0.6,
    h: 4.2,
    fontFace: font,
    valign: 'top',
  });

  const chartW = 5.9;
  const chartLabels = slideData.chartLabels?.length ? slideData.chartLabels : ['Q1', 'Q2', 'Q3', 'Q4'];
  const chartValues = slideData.chartValues?.length ? slideData.chartValues : [35, 55, 78, 100];

  const chartData = [
    {
      name: 'Actual / Projected',
      labels: chartLabels,
      values: chartValues,
    },
  ];

  slide.addChart(pptx.charts.BAR, chartData, {
    x: 6.6,
    y: 1.8,
    w: chartW,
    h: 4.8,
    showTitle: true,
    title: slideData.chartTitle || 'Projected Performance & Growth',
    titleFontSize: 12,
    titleColor: palette.textDark,
    chartColors: palette.chartFill,
    valAxisMinVal: 0,
    showLegend: false,
    barDir: 'col',
  });

  slide.addText(`${index + 1} / ${total}`, {
    x: 11.5,
    y: 7.0,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8',
    align: 'right',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

/**
 * 7. Standard Content Slide
 */
function renderContentSlide(pptx, slideData, palette, index, total, font) {
  const slide = pptx.addSlide();
  slide.background = { color: palette.bg };

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.08,
    fill: { color: palette.primary },
  });

  slide.addText(slideData.title || `Slide ${index + 1}`, {
    x: 0.8,
    y: 0.5,
    w: 11.7,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: palette.textDark,
    fontFace: font,
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: font,
    });
  }

  let contentStartY = 1.6;
  if (slideData.content) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.6,
      w: 11.73,
      h: 0.8,
      rectRadius: 0.1,
      fill: { color: 'EFF6FF' },
      line: { color: 'DBEAFE', width: 1 },
    });

    slide.addText(slideData.content, {
      x: 1.1,
      y: 1.65,
      w: 11.1,
      h: 0.7,
      fontSize: 11,
      color: palette.textDark,
      fontFace: font,
      valign: 'middle',
    });

    contentStartY = 2.6;
  }

  const bullets = (slideData.bullets || []).filter((b) => b && b.trim());
  if (bullets.length > 0) {
    const maxItems = Math.min(bullets.length, 5);
    const itemHeight = Math.min(0.75, (6.4 - contentStartY) / maxItems - 0.1);

    bullets.slice(0, maxItems).forEach((bulletText, i) => {
      const itemY = contentStartY + i * (itemHeight + 0.15);

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8,
        y: itemY,
        w: 11.73,
        h: itemHeight,
        rectRadius: 0.08,
        fill: { color: palette.cardBg },
        line: { color: palette.border, width: 1 },
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 1.1,
        y: itemY + itemHeight / 2 - 0.08,
        w: 0.16,
        h: 0.16,
        fill: { color: palette.accent },
        line: { color: palette.accent },
      });

      const cleanText = bulletText.replace(/^[-•*]\s*/, '');
      slide.addText(cleanText, {
        x: 1.45,
        y: itemY,
        w: 10.8,
        h: itemHeight,
        fontSize: 11,
        color: palette.textDark,
        fontFace: font,
        valign: 'middle',
      });
    });
  }

  slide.addText(`${index + 1} / ${total}`, {
    x: 11.5,
    y: 7.0,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8',
    align: 'right',
    fontFace: 'Arial',
  });

  if (slideData.notes) slide.addNotes(slideData.notes);
  return slide;
}

// ── Public Export Function ─────────────────────────────────────────

export async function generatePptxBuffer(presentation) {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title || 'SlideAI Presentation';
  pptx.author = 'SlideAI Platform';
  pptx.company = 'SlideAI';

  const themeName = presentation.theme?.colorTheme || presentation.colorTheme || 'indigo';
  const palette = getPalette(themeName);

  // Select the right Unicode font based on the presentation language
  const font = getFont(presentation.language || 'English (US)');

  const slides = presentation.slides || [];
  const total = slides.length;

  slides.forEach((slide, index) => {
    const layout = slide.layout || (index === 0 ? 'title' : 'content');

    switch (layout) {
      case 'title':
        renderTitleSlide(pptx, slide, palette, presentation, font);
        break;
      case 'infographic':
        renderInfographicSlide(pptx, slide, palette, index, total, font);
        break;
      case 'image-right':
        renderImageRightSlide(pptx, slide, palette, index, total, font);
        break;
      case 'image-left':
        renderImageLeftSlide(pptx, slide, palette, index, total, font);
        break;
      case 'stats':
        renderStatsSlide(pptx, slide, palette, index, total, font);
        break;
      case 'chart':
        renderChartSlide(pptx, slide, palette, index, total, font);
        break;
      case 'content':
      default:
        renderContentSlide(pptx, slide, palette, index, total, font);
        break;
    }
  });

  return await pptx.write({ outputType: 'nodebuffer' });
}
