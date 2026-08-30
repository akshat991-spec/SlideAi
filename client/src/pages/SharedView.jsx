import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { presentationService } from '../services/presentationService.js';
import { PageLoader } from '../components/shared/LoadingSpinner.jsx';

const THEME_COLORS = {
  indigo: { bg: '#eef2ff', accent: '#4338ca', text: '#1e1b4b', subtitle: '#4338ca' },
  blue:   { bg: '#eff6ff', accent: '#2563eb', text: '#1e3a8a', subtitle: '#2563eb' },
  emerald:{ bg: '#ecfdf5', accent: '#059669', text: '#064e3b', subtitle: '#059669' },
  amber:  { bg: '#fffbeb', accent: '#d97706', text: '#78350f', subtitle: '#d97706' },
  rose:   { bg: '#fff1f2', accent: '#e11d48', text: '#881337', subtitle: '#e11d48' },
  slate:  { bg: '#f8fafc', accent: '#475569', text: '#0f172a', subtitle: '#475569' },
};

export default function SharedView() {
  const { shareId } = useParams();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    presentationService.getShared(shareId)
      .then((res) => setPresentation(res.data.presentation))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <PageLoader />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-300" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Presentation Not Found</h1>
          <p className="text-gray-500">This link may have expired or been disabled by the owner.</p>
        </div>
      </div>
    );
  }

  const slides = presentation.slides || [];
  const current = slides[currentIndex];
  const colors = THEME_COLORS[presentation.theme?.colorTheme || 'indigo'] || THEME_COLORS.indigo;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary-700 flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">SlideAI</span>
        <span className="text-gray-600">·</span>
        <span className="text-sm text-gray-300 truncate">{presentation.title}</span>
        <span className="ml-auto text-xs text-gray-500">{currentIndex + 1}/{slides.length}</span>
      </div>

      {/* Slide */}
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-56px)]">
        {current && (
          <div className="w-full shadow-2xl rounded-xl overflow-hidden"
            style={{ maxWidth: 'min(90vw,960px)', aspectRatio: '16/9', background: colors.bg }}>
            <div className="w-full h-full flex relative">
              <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: colors.accent }} />
              <div className="flex-1 pl-10 pr-8 py-12 flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{current.title}</h1>
                {current.subtitle && <p className="text-lg font-medium mb-4" style={{ color: colors.subtitle }}>{current.subtitle}</p>}
                {current.bullets?.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {current.bullets.slice(0, 6).map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                        <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
                        <span>{b.replace(/^[-•]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {current.content && !current.bullets?.length && (
                  <p className="text-gray-600 text-base leading-relaxed">{current.content}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-800/90 backdrop-blur rounded-full px-5 py-2.5 shadow-xl">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="text-white disabled:opacity-30 hover:text-primary-400 transition-colors"
        >←</button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-primary-500' : 'bg-gray-600 hover:bg-gray-400'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
          className="text-white disabled:opacity-30 hover:text-primary-400 transition-colors"
        >→</button>
      </div>
    </div>
  );
}
