import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

/**
 * SlideAI Professional PowerPoint (.pptx) Generator
 *
 * Implements a modern executive design system with:
 * - 16:9 Widescreen slide dimensions
 * - Curated brand palettes (Indigo, Blue, Emerald, Slate)
 * - Structured component layouts: Hero Title, Image-Right/Left, Stats/KPIs, Charts, Timelines, Two-Column
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

// ── Slide Creators ─────────────────────────────────────────────────

/**
 * 1. Title / Hero Slide
 */
function renderTitleSlide(pptx, slideData, palette, presentationMeta) {
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
    fontFace: 'Arial',
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
      fontFace: 'Arial',
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
 * 2. Image-Right Slide
 */
function renderImageRightSlide(pptx, slideData, palette, index, total) {
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
    fontFace: 'Arial',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: 'Arial',
    });
  }

  // Left side: Text & Bullets card
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
      fontFace: 'Arial',
      valign: 'top',
    }
  );

  // Right side: Image or Visual Placeholder Card
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
      // Fallback if image fetch fails
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
 * 3. Image-Left Slide
 */
function renderImageLeftSlide(pptx, slideData, palette, index, total) {
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
    fontFace: 'Arial',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: 'Arial',
    });
  }

  // Left side: Image Card
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

  // Right side: Text & Bullets card
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
      fontFace: 'Arial',
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
 * 4. Stats / KPI Slide
 */
function renderStatsSlide(pptx, slideData, palette, index, total) {
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
    fontFace: 'Arial',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: 'Arial',
    });
  }

  // 3 Big KPI Stat Cards
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
      fontFace: 'Arial',
    });
  });

  // Bullets on bottom
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
      fontFace: 'Arial',
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
 * 5. Chart Slide
 */
function renderChartSlide(pptx, slideData, palette, index, total) {
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
    fontFace: 'Arial',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: 'Arial',
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
    fontFace: 'Arial',
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
 * 6. Standard Content Slide
 */
function renderContentSlide(pptx, slideData, palette, index, total) {
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
    fontFace: 'Arial',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.15,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: palette.accent,
      fontFace: 'Arial',
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
      fontFace: 'Arial',
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
        fontFace: 'Arial',
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

  const slides = presentation.slides || [];
  const total = slides.length;

  slides.forEach((slide, index) => {
    const layout = slide.layout || (index === 0 ? 'title' : 'content');

    switch (layout) {
      case 'title':
        renderTitleSlide(pptx, slide, palette, presentation);
        break;
      case 'image-right':
        renderImageRightSlide(pptx, slide, palette, index, total);
        break;
      case 'image-left':
        renderImageLeftSlide(pptx, slide, palette, index, total);
        break;
      case 'stats':
        renderStatsSlide(pptx, slide, palette, index, total);
        break;
      case 'chart':
        renderChartSlide(pptx, slide, palette, index, total);
        break;
      case 'content':
      default:
        renderContentSlide(pptx, slide, palette, index, total);
        break;
    }
  });

  return await pptx.write({ outputType: 'nodebuffer' });
}
