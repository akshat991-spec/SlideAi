import React from 'react';
import { useEditor } from '../../context/EditorContext.jsx';
import {
  Minus, Plus, TrendingUp, Sparkles, CheckCircle2, Clock, BarChart3,
  Image as ImageIcon, ArrowRight, Layers, ShieldCheck, Cpu, Zap, Target
} from 'lucide-react';

const THEME_COLORS = {
  indigo: { bg: '#F8FAFC', cardBg: '#FFFFFF', accent: '#4338CA', text: '#0F172A', subtitle: '#6366F1', bullet: '#4F46E5', border: '#E2E8F0', statBg: '#EEF2FF' },
  blue:   { bg: '#F0F9FF', cardBg: '#FFFFFF', accent: '#0284C7', text: '#0C4A6E', subtitle: '#0EA5E9', bullet: '#0284C7', border: '#E0F2FE', statBg: '#E0F2FE' },
  emerald:{ bg: '#F0FDF4', cardBg: '#FFFFFF', accent: '#059669', text: '#064E3B', subtitle: '#10B981', bullet: '#059669', border: '#DCFCE7', statBg: '#DCFCE7' },
  slate:  { bg: '#F8FAFC', cardBg: '#FFFFFF', accent: '#334155', text: '#0F172A', subtitle: '#64748B', bullet: '#475569', border: '#E2E8F0', statBg: '#F1F5F9' },
  default:{ bg: '#F8FAFC', cardBg: '#FFFFFF', accent: '#4338CA', text: '#0F172A', subtitle: '#6366F1', bullet: '#4F46E5', border: '#E2E8F0', statBg: '#EEF2FF' },
};

function renderBullet(text, accentColor) {
  if (!text) return null;
  const clean = text.replace(/^[-•*]\s*/, '');
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold" style={{ color: accentColor }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function SlideRenderer({ slide, colors }) {
  const layout = slide.layout || 'content';

  const bullets = Array.isArray(slide.bullets) && slide.bullets.length > 0
    ? slide.bullets
    : slide.content
    ? slide.content.split('\n').filter((l) => l.trim())
    : [];

  const metrics = Array.isArray(slide.metrics) && slide.metrics.length > 0
    ? slide.metrics
    : [
        { label: 'Efficiency Multiplier', value: '+45%' },
        { label: 'Annual Overhead Saved', value: '$2.4M' },
        { label: 'Adoption Rate', value: '98%' },
      ];

  const chartLabels = Array.isArray(slide.chartLabels) && slide.chartLabels.length > 0
    ? slide.chartLabels
    : ['Q1', 'Q2', 'Q3', 'Q4'];

  const chartValues = Array.isArray(slide.chartValues) && slide.chartValues.length > 0
    ? slide.chartValues
    : [35, 60, 85, 115];

  const maxVal = Math.max(...chartValues, 100);

  const infographicItems = Array.isArray(slide.infographicData) && slide.infographicData.length > 0
    ? slide.infographicData
    : [
        { step: 1, title: 'Intelligent Telemetry', description: 'Real-time telemetry and edge data synthesis.', value: 'Pillar 01' },
        { step: 2, title: 'Adaptive Core', description: 'Autonomous optimization with continuous feedback.', value: 'Pillar 02' },
        { step: 3, title: 'Enterprise Scaling', description: 'Zero-downtime distributed deployment architecture.', value: 'Pillar 03' },
      ];

  // 1. Hero Title Slide
  if (layout === 'title') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-12 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: colors.accent }} />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: colors.accent }} />

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full text-white shadow-sm" style={{ background: colors.accent }}>
            PRESENTATION DECK
          </span>
        </div>

        <div className="my-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight" style={{ color: colors.text }}>
            {slide.title || 'Untitled Presentation'}
          </h1>
          {slide.subtitle && (
            <p className="text-xl font-medium leading-relaxed opacity-90" style={{ color: colors.subtitle }}>
              {slide.subtitle}
            </p>
          )}
          {slide.content && (
            <p className="text-sm mt-4 text-gray-600 max-w-2xl leading-relaxed">
              {slide.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-200/60 pt-4">
          <span>Executive Presentation</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    );
  }

  // 2. Infographic Layout (Pillars / Process / Matrix)
  if (layout === 'infographic') {
    const isProcess = slide.infographicType === 'process';

    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ background: colors.accent }}>
              INFOGRAPHIC
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        {slide.content && (
          <div className="bg-white/90 rounded-xl p-3 border border-gray-200/70 text-xs text-gray-700 mb-3 leading-relaxed">
            {slide.content}
          </div>
        )}

        {/* Infographic Grid */}
        <div className={`grid gap-4 my-auto ${infographicItems.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {infographicItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-primary-400 transition-all"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: colors.accent }} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {item.value || `0${idx + 1}`}
                  </span>
                  {isProcess && idx < infographicItems.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  )}
                  {!isProcess && (
                    <Zap className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: colors.accent }}>
                <CheckCircle2 className="w-3 h-3" /> Core Dimension
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Image-Right Slide (Photo + Takeaways)
  if (layout === 'image-right') {
    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 items-center">
          <div className="col-span-7 space-y-3">
            {slide.content && (
              <div className="bg-white rounded-xl p-3.5 border border-gray-200/70 shadow-xs text-xs text-gray-700 leading-relaxed">
                {slide.content}
              </div>
            )}
            <div className="space-y-2">
              {bullets.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/80 rounded-lg p-2.5 border border-gray-200/60 shadow-2xs text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="leading-snug">{renderBullet(b, colors.accent)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 h-full max-h-[300px] rounded-2xl overflow-hidden shadow-md border border-gray-200 relative group bg-gray-100 flex items-center justify-center">
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 text-xs p-4 text-center">
                <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                <span>Visual context</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Image-Left Slide
  if (layout === 'image-left') {
    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 items-center">
          <div className="col-span-5 h-full max-h-[300px] rounded-2xl overflow-hidden shadow-md border border-gray-200 relative group bg-gray-100 flex items-center justify-center">
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 text-xs p-4 text-center">
                <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                <span>Visual context</span>
              </div>
            )}
          </div>

          <div className="col-span-7 space-y-3">
            {slide.content && (
              <div className="bg-white rounded-xl p-3.5 border border-gray-200/70 shadow-xs text-xs text-gray-700 leading-relaxed">
                {slide.content}
              </div>
            )}
            <div className="space-y-2">
              {bullets.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/80 rounded-lg p-2.5 border border-gray-200/60 shadow-2xs text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="leading-snug">{renderBullet(b, colors.accent)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Stats / KPI Metric Cards Slide
  if (layout === 'stats') {
    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        {slide.content && (
          <div className="bg-white/90 rounded-xl p-3.5 border border-gray-200/70 shadow-xs text-xs text-gray-700 mb-4 leading-relaxed">
            {slide.content}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 my-auto">
          {metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: colors.accent }} />
              <span className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: colors.accent }}>
                {m.value}
              </span>
              <span className="text-xs font-medium text-gray-600">{m.label}</span>
            </div>
          ))}
        </div>

        {bullets.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {bullets.slice(0, 2).map((b, i) => (
              <div key={i} className="bg-white/80 rounded-lg p-2.5 border border-gray-200/60 text-xs text-gray-700 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
                <span>{renderBullet(b, colors.accent)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6. Chart / Analytics Slide
  if (layout === 'chart') {
    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 items-center">
          <div className="col-span-6 space-y-3">
            {slide.content && (
              <div className="bg-white rounded-xl p-3.5 border border-gray-200/70 shadow-xs text-xs text-gray-700 leading-relaxed">
                {slide.content}
              </div>
            )}
            <div className="space-y-2">
              {bullets.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/80 rounded-lg p-2.5 border border-gray-200/60 shadow-2xs text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="leading-snug">{renderBullet(b, colors.accent)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-6 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-[280px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                {slide.chartTitle || 'Growth & Performance Trajectory'}
              </span>
              <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +145% YoY
              </span>
            </div>

            <div className="flex items-end justify-around gap-4 h-36 pt-4 pb-2">
              {chartLabels.map((lbl, i) => {
                const val = chartValues[i] || 50;
                const pct = Math.min(100, Math.round((val / maxVal) * 100));
                const isMax = i === chartLabels.length - 1;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end group">
                    <span className="text-[10px] font-bold text-gray-600">{val}%</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-500 shadow-xs"
                      style={{
                        height: `${pct}%`,
                        background: isMax ? colors.accent : `${colors.accent}45`,
                      }}
                    />
                    <span className="text-[10px] font-medium text-gray-400">{lbl}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Timeline / Process Slide
  if (layout === 'timeline') {
    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        {slide.content && (
          <div className="bg-white rounded-xl p-3 border border-gray-200/70 text-xs text-gray-700 mb-4 leading-relaxed">
            {slide.content}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 my-auto">
          {bullets.slice(0, 3).map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs" style={{ background: colors.accent }}>
                  0{i + 1}
                </span>
                <Clock className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-700 leading-snug">{renderBullet(b, colors.accent)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. Two-Column Slide
  if (layout === 'two-column') {
    const midpoint = Math.ceil(bullets.length / 2);
    const leftCol = bullets.slice(0, midpoint);
    const rightCol = bullets.slice(midpoint);

    return (
      <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6 my-auto">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1.5">Core Drivers</h4>
            {leftCol.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.accent }} />
                <span>{renderBullet(b, colors.accent)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1.5">Strategic Implications</h4>
            {rightCol.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.accent }} />
                <span>{renderBullet(b, colors.accent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 9. Default Executive Content Slide
  return (
    <div className="w-full h-full flex flex-col p-10 relative overflow-hidden" style={{ background: colors.bg }}>
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />

      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title || 'Untitled Slide'}</h2>
        {slide.subtitle && <p className="text-xs font-medium mt-0.5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
      </div>

      {slide.content && (
        <div className="bg-white rounded-xl p-3.5 border border-gray-200/70 shadow-xs text-xs text-gray-700 mb-3.5 leading-relaxed">
          {slide.content}
        </div>
      )}

      <div className="space-y-2.5 my-auto">
        {bullets.slice(0, 5).map((bullet, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/90 rounded-xl p-3 border border-gray-200/60 shadow-2xs text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0 shadow-2xs" style={{ background: colors.accent }} />
            <div className="leading-snug">{renderBullet(bullet, colors.accent)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SlideCanvas() {
  const { selectedSlide, presentation } = useEditor();
  const [zoom, setZoom] = React.useState(100);

  const colors = THEME_COLORS[presentation?.colorTheme || 'indigo'] || THEME_COLORS.default;

  return (
    <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center overflow-hidden relative p-4">
      {/* Slide Canvas */}
      <div
        id="slide-canvas"
        className="shadow-2xl rounded-xl overflow-hidden border border-gray-300/60 transition-all duration-200"
        style={{
          width: `${(16/9) * 4.2 * zoom}px`,
          height: `${4.2 * zoom}px`,
          maxWidth: '92%',
          maxHeight: '86%',
        }}
      >
        {selectedSlide ? (
          <SlideRenderer slide={selectedSlide} colors={colors} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white text-gray-400 text-sm">
            Select a slide to edit
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg shadow-card border border-gray-200 px-2 py-1 z-10">
        <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="btn-ghost p-1">
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-xs text-gray-600 w-8 text-center">{zoom}%</span>
        <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="btn-ghost p-1">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
