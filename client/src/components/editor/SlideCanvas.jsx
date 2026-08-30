import React from 'react';
import { useEditor } from '../../context/EditorContext.jsx';
import { Minus, Plus } from 'lucide-react';

const THEME_COLORS = {
  indigo: { bg: '#eef2ff', accent: '#4338ca', text: '#1e1b4b', subtitle: '#4338ca', bullet: '#4338ca' },
  blue:   { bg: '#eff6ff', accent: '#2563eb', text: '#1e3a8a', subtitle: '#2563eb', bullet: '#2563eb' },
  default:{ bg: '#eef2ff', accent: '#4338ca', text: '#1e1b4b', subtitle: '#4338ca', bullet: '#4338ca' },
};

function renderBullet(text, color) {
  // Bold markdown-like (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function SlideRenderer({ slide, colors }) {
  const bullets = slide.content
    ? slide.content.split('\n').filter((l) => l.trim()).slice(0, 6)
    : [];

  return (
    <div
      className="w-full h-full flex relative overflow-hidden"
      style={{ background: colors.bg }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: colors.accent }} />

      {/* Content */}
      <div className="flex-1 pl-8 pr-6 py-10 flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-2 leading-tight" style={{ color: colors.text }}>
          {slide.title || 'Untitled Slide'}
        </h1>
        {slide.subtitle && (
          <p className="text-lg mb-6 font-medium" style={{ color: colors.subtitle }}>
            {slide.subtitle}
          </p>
        )}
        {bullets.length > 0 && (
          <ul className="space-y-3">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.bullet }} />
                <span>{renderBullet(bullet.replace(/^[-•]\s*/, ''), colors.accent)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Speaker notes hint */}
        {slide.speakerNotes && (
          <div className="absolute bottom-4 left-8 right-6 bg-white/60 backdrop-blur rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500 font-medium mb-0.5">Speaker Notes</p>
            <p className="text-xs text-gray-600 line-clamp-2">{slide.speakerNotes}</p>
          </div>
        )}
      </div>

      {/* Chart area (if layout is chart/two-column) */}
      {(slide.layout === 'chart' || slide.layout === 'two-column') && (
        <div className="w-2/5 flex-shrink-0 flex items-center justify-center p-6">
          <div className="w-full h-full bg-white/70 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <p className="text-xs font-medium text-gray-500">{slide.chartTitle || 'Projected Growth (YoY)'}</p>
            {/* Decorative bar chart */}
            <div className="flex items-end justify-around gap-3 h-32">
              {[0.4, 0.6, 0.75, 1].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{ height: `${h * 100}%`, background: i === 3 ? colors.accent : `${colors.accent}40` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SlideCanvas() {
  const { selectedSlide, presentation } = useEditor();
  const [zoom, setZoom] = React.useState(100);

  const colors = THEME_COLORS[presentation?.colorTheme || 'indigo'] || THEME_COLORS.default;

  return (
    <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Slide */}
      <div
        id="slide-canvas"
        className="shadow-2xl rounded-sm overflow-hidden"
        style={{
          width: `${(16/9) * 4 * zoom}px`,
          height: `${4 * zoom}px`,
          maxWidth: '90%',
          maxHeight: '80%',
          transition: 'width 0.2s, height 0.2s',
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
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-card border border-gray-200 px-2 py-1">
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
