import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Layers, Maximize2, Minimize2, TrendingUp, BarChart3, Clock, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { presentationService } from '../../services/presentationService.js';
import { PageLoader } from '../../components/shared/LoadingSpinner.jsx';

const THEME_COLORS = {
  indigo: { bg: '#F8FAFC', cardBg: '#FFFFFF', accent: '#4338CA', text: '#0F172A', subtitle: '#6366F1', bullet: '#4F46E5', border: '#E2E8F0' },
  blue:   { bg: '#F0F9FF', cardBg: '#FFFFFF', accent: '#0284C7', text: '#0C4A6E', subtitle: '#0EA5E9', bullet: '#0284C7', border: '#E0F2FE' },
  emerald:{ bg: '#F0FDF4', cardBg: '#FFFFFF', accent: '#059669', text: '#064E3B', subtitle: '#10B981', bullet: '#059669', border: '#DCFCE7' },
  amber:  { bg: '#FFFBEB', cardBg: '#FFFFFF', accent: '#D97706', text: '#78350F', subtitle: '#F59E0B', bullet: '#D97706', border: '#FEF3C7' },
  rose:   { bg: '#FFF1F2', cardBg: '#FFFFFF', accent: '#E11D48', text: '#881337', subtitle: '#F43F5E', bullet: '#E11D48', border: '#FFE4E6' },
  slate:  { bg: '#F8FAFC', cardBg: '#FFFFFF', accent: '#334155', text: '#0F172A', subtitle: '#64748B', bullet: '#475569', border: '#E2E8F0' },
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

function SlideView({ slide, colors }) {
  const layout = slide.layout || 'content';

  const bullets = Array.isArray(slide.bullets) && slide.bullets.length > 0
    ? slide.bullets
    : slide.content
    ? slide.content.split('\n').filter((l) => l.trim())
    : [];

  const metrics = Array.isArray(slide.metrics) && slide.metrics.length > 0
    ? slide.metrics
    : [
        { label: 'Efficiency Gain', value: '+45%' },
        { label: 'Annual Savings', value: '$2.4M' },
        { label: 'Satisfaction', value: '98%' },
      ];

  const chartLabels = Array.isArray(slide.chartLabels) && slide.chartLabels.length > 0
    ? slide.chartLabels
    : ['Q1', 'Q2', 'Q3', 'Q4'];

  const chartValues = Array.isArray(slide.chartValues) && slide.chartValues.length > 0
    ? slide.chartValues
    : [35, 60, 85, 115];

  const maxVal = Math.max(...chartValues, 100);

  // 1. Hero Title Slide
  if (layout === 'title') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-16 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-2.5" style={{ background: colors.accent }} />
        <div className="absolute -right-24 -bottom-24 w-[450px] h-[450px] rounded-full opacity-10 blur-3xl" style={{ background: colors.accent }} />

        <div>
          <span className="text-xs font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full text-white shadow-sm" style={{ background: colors.accent }}>
            PRESENTATION DECK
          </span>
        </div>

        <div className="my-auto max-w-4xl">
          <h1 className="text-5xl font-extrabold leading-tight mb-4 tracking-tight" style={{ color: colors.text }}>
            {slide.title || 'Untitled Presentation'}
          </h1>
          {slide.subtitle && (
            <p className="text-2xl font-medium leading-relaxed opacity-90" style={{ color: colors.subtitle }}>
              {slide.subtitle}
            </p>
          )}
          {slide.content && (
            <p className="text-base mt-5 text-gray-600 max-w-3xl leading-relaxed">
              {slide.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-200/60 pt-4">
          <span>Executive Keynote</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    );
  }

  // 2. Image-Right
  if (layout === 'image-right') {
    return (
      <div className="w-full h-full flex flex-col p-14 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: colors.accent }} />

        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-sm font-medium mt-1" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-12 gap-8 flex-1 items-center">
          <div className="col-span-7 space-y-4">
            {slide.content && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-sm text-sm text-gray-700 leading-relaxed">
                {slide.content}
              </div>
            )}
            <div className="space-y-3">
              {bullets.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/90 rounded-xl p-3.5 border border-gray-200/60 shadow-xs text-sm text-gray-700">
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="leading-snug">{renderBullet(b, colors.accent)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 h-full max-h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-300" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Image-Left
  if (layout === 'image-left') {
    return (
      <div className="w-full h-full flex flex-col p-14 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: colors.accent }} />

        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-sm font-medium mt-1" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-12 gap-8 flex-1 items-center">
          <div className="col-span-5 h-full max-h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-300" />
            )}
          </div>

          <div className="col-span-7 space-y-4">
            {slide.content && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-sm text-sm text-gray-700 leading-relaxed">
                {slide.content}
              </div>
            )}
            <div className="space-y-3">
              {bullets.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/90 rounded-xl p-3.5 border border-gray-200/60 shadow-xs text-sm text-gray-700">
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="leading-snug">{renderBullet(b, colors.accent)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Stats / KPI Cards
  if (layout === 'stats') {
    return (
      <div className="w-full h-full flex flex-col p-14 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: colors.accent }} />

        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-sm font-medium mt-1" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        {slide.content && (
          <div className="bg-white/90 rounded-2xl p-4 border border-gray-200 shadow-xs text-sm text-gray-700 mb-6 leading-relaxed">
            {slide.content}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 my-auto">
          {metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: colors.accent }} />
              <span className="text-5xl font-extrabold tracking-tight mb-2" style={{ color: colors.accent }}>{m.value}</span>
              <span className="text-sm font-medium text-gray-600">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Chart / Analytics
  if (layout === 'chart') {
    return (
      <div className="w-full h-full flex flex-col p-14 relative overflow-hidden" style={{ background: colors.bg }}>
        <div className="absolute top-0 left-0 right-0 h-2" style={{ background: colors.accent }} />

        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title}</h2>
          {slide.subtitle && <p className="text-sm font-medium mt-1" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        </div>

        <div className="grid grid-cols-12 gap-8 flex-1 items-center">
          <div className="col-span-6 space-y-4">
            {slide.content && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-sm text-sm text-gray-700 leading-relaxed">
                {slide.content}
              </div>
            )}
            <div className="space-y-3">
              {bullets.slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/90 rounded-xl p-3.5 border border-gray-200/60 shadow-xs text-sm text-gray-700">
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="leading-snug">{renderBullet(b, colors.accent)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-6 bg-white rounded-3xl p-6 border border-gray-200 shadow-md flex flex-col justify-between h-[340px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: colors.accent }} />
                {slide.chartTitle || 'Growth & Performance Trajectory'}
              </span>
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +145% YoY
              </span>
            </div>

            <div className="flex items-end justify-around gap-5 h-44 pt-4 pb-2">
              {chartLabels.map((lbl, i) => {
                const val = chartValues[i] || 50;
                const pct = Math.min(100, Math.round((val / maxVal) * 100));
                const isMax = i === chartLabels.length - 1;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <span className="text-xs font-bold text-gray-600">{val}%</span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 shadow-xs"
                      style={{ height: `${pct}%`, background: isMax ? colors.accent : `${colors.accent}45` }}
                    />
                    <span className="text-xs font-medium text-gray-400">{lbl}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Default Content / Two-column
  return (
    <div className="w-full h-full flex flex-col p-14 relative overflow-hidden" style={{ background: colors.bg }}>
      <div className="absolute top-0 left-0 right-0 h-2" style={{ background: colors.accent }} />

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>{slide.title || 'Untitled Slide'}</h2>
        {slide.subtitle && <p className="text-sm font-medium mt-1" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
      </div>

      {slide.content && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-sm text-sm text-gray-700 mb-4 leading-relaxed">
          {slide.content}
        </div>
      )}

      <div className="space-y-3.5 my-auto">
        {bullets.slice(0, 5).map((bullet, i) => (
          <div key={i} className="flex items-start gap-3.5 bg-white/95 rounded-2xl p-4 border border-gray-200/60 shadow-xs text-sm text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-2xs" style={{ background: colors.accent }} />
            <div className="leading-snug">{renderBullet(bullet, colors.accent)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    presentationService.get(id)
      .then((res) => setPresentation(res.data.presentation))
      .catch(() => navigate('/presentations'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex((i) => Math.min((presentation?.slides?.length || 1) - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation, fullscreen]);

  if (loading) return <PageLoader />;
  if (!presentation) return null;

  const slides = presentation.slides || [];
  const currentSlide = slides[currentIndex] || {};
  const colors = THEME_COLORS[presentation.theme?.colorTheme || 'indigo'] || THEME_COLORS.indigo;

  return (
    <div className={`flex flex-col bg-slate-900 ${fullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Top bar */}
      <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-700/60 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost text-slate-300 hover:text-white p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white truncate max-w-sm">{presentation.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-2">
            {currentIndex + 1} of {slides.length}
          </span>
          <button onClick={() => setFullscreen((f) => !f)} className="btn-ghost text-slate-300 hover:text-white p-2">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main presentation display */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div
          className="aspect-video w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/40 relative"
          style={{ maxHeight: '82vh' }}
        >
          <SlideView slide={currentSlide} colors={colors} />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(slides.length - 1, i + 1))}
          disabled={currentIndex === slides.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
