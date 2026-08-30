import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Layers } from 'lucide-react';
import { presentationService } from '../../services/presentationService.js';
import { PageLoader } from '../../components/shared/LoadingSpinner.jsx';

const THEME_COLORS = {
  indigo: { bg: '#eef2ff', accent: '#4338ca', text: '#1e1b4b', subtitle: '#4338ca' },
  blue:   { bg: '#eff6ff', accent: '#2563eb', text: '#1e3a8a', subtitle: '#2563eb' },
  emerald:{ bg: '#ecfdf5', accent: '#059669', text: '#064e3b', subtitle: '#059669' },
  amber:  { bg: '#fffbeb', accent: '#d97706', text: '#78350f', subtitle: '#d97706' },
  rose:   { bg: '#fff1f2', accent: '#e11d48', text: '#881337', subtitle: '#e11d48' },
  slate:  { bg: '#f8fafc', accent: '#475569', text: '#0f172a', subtitle: '#475569' },
};

function SlideView({ slide, colors }) {
  const bullets = slide.bullets?.length ? slide.bullets : 
    (slide.content ? slide.content.split('\n').filter(l => l.trim()) : []);

  if (slide.layout === 'title') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center px-16"
        style={{ background: colors.bg }}>
        <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: colors.accent }} />
        <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ color: colors.text }}>{slide.title}</h1>
        {slide.subtitle && <p className="text-xl font-medium" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        {slide.content && <p className="text-base text-gray-500 mt-4">{slide.content}</p>}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex relative overflow-hidden" style={{ background: colors.bg }}>
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: colors.accent }} />
      <div className="flex-1 pl-10 pr-8 py-12 flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-2 leading-tight" style={{ color: colors.text }}>{slide.title}</h1>
        {slide.subtitle && <p className="text-base font-medium mb-5" style={{ color: colors.subtitle }}>{slide.subtitle}</p>}
        {slide.content && !bullets.length && (
          <p className="text-gray-600 text-base leading-relaxed">{slide.content}</p>
        )}
        {bullets.length > 0 && (
          <ul className="space-y-3 mt-2">
            {bullets.slice(0, 6).map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
                <span>{b.replace(/^[-•]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(slide.layout === 'chart' || slide.layout === 'two-column') && (
        <div className="w-2/5 flex-shrink-0 flex items-center justify-center p-8">
          <div className="w-full h-48 bg-white/80 rounded-2xl p-4 flex flex-col justify-between shadow">
            <p className="text-xs font-medium text-gray-500">Projected Growth (YoY)</p>
            <div className="flex items-end justify-around gap-2 h-32">
              {[0.35, 0.55, 0.75, 1].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h*100}%`, background: i===3 ? colors.accent : `${colors.accent}40` }} />
              ))}
            </div>
          </div>
        </div>
      )}
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
  }, [id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex((i) => Math.min(i + 1, (presentation?.slides?.length || 1) - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Escape') {
        navigate(`/presentations/${id}/edit`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presentation]);

  if (loading) return <PageLoader />;
  if (!presentation) return null;

  const slides = presentation.slides || [];
  const current = slides[currentIndex];
  const colors = THEME_COLORS[presentation.theme?.colorTheme || 'indigo'] || THEME_COLORS.indigo;
  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col" style={{ zIndex: 100 }}>
      {/* Top bar */}
      <div className="h-12 bg-gray-900/80 backdrop-blur flex items-center px-4 gap-3 flex-shrink-0 border-b border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-primary-700 flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-white hidden sm:block">SlideAI</span>
        </div>
        <div className="w-px h-4 bg-gray-700 mx-1" />
        <span className="text-sm text-white/80 font-medium truncate flex-1">{presentation.title}</span>
        <span className="text-xs text-gray-400">{currentIndex + 1} / {slides.length}</span>
        <button
          onClick={() => navigate(`/presentations/${id}/edit`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors ml-2"
          id="exit-preview-btn"
        >
          <X className="w-4 h-4" /> Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-gray-800">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: colors.accent }}
        />
      </div>

      {/* Slide area */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {current && (
          <div
            id="preview-slide"
            className="w-full shadow-2xl rounded-lg overflow-hidden relative"
            style={{ maxWidth: 'min(90vw, 1080px)', aspectRatio: '16/9' }}
          >
            <SlideView slide={current} colors={colors} />
          </div>
        )}

        {/* Nav arrows */}
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white disabled:opacity-20 transition-all"
          id="prev-slide-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white disabled:opacity-20 transition-all"
          id="next-slide-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide strip */}
      <div className="h-20 bg-gray-900/80 border-t border-gray-800 flex items-center gap-2 px-4 overflow-x-auto">
        {slides.map((slide, i) => (
          <button
            key={slide._id || i}
            onClick={() => setCurrentIndex(i)}
            className={`flex-shrink-0 h-12 rounded overflow-hidden border-2 transition-all ${
              i === currentIndex ? 'border-primary-500 scale-105' : 'border-gray-700 hover:border-gray-500'
            }`}
            style={{ width: `${(16/9) * 48}px` }}
          >
            <div className="w-full h-full flex items-center justify-center text-[6px] text-white/60 overflow-hidden"
              style={{ background: colors.bg }}>
              <span className="text-gray-800 font-bold text-[7px] px-1 truncate">{slide.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-xs text-gray-600">
        Use ← → arrow keys or Space to navigate
      </div>
    </div>
  );
}
