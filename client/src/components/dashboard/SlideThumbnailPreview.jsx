import React from 'react';

const THEME_COLORS = {
  indigo: { bg: '#eef2ff', accent: '#4338ca', text: '#3730a3' },
  blue:   { bg: '#eff6ff', accent: '#2563eb', text: '#1d4ed8' },
  emerald:{ bg: '#ecfdf5', accent: '#059669', text: '#047857' },
  amber:  { bg: '#fffbeb', accent: '#d97706', text: '#b45309' },
  rose:   { bg: '#fff1f2', accent: '#e11d48', text: '#be123c' },
  slate:  { bg: '#f8fafc', accent: '#475569', text: '#334155' },
  default:{ bg: '#eef2ff', accent: '#4338ca', text: '#3730a3' },
};

export default function SlideThumbnailPreview({ slides = [], theme = 'indigo' }) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.default;
  const firstSlide = slides?.[0];

  return (
    <div
      className="w-full overflow-hidden rounded-t-xl"
      style={{ aspectRatio: '16/9', background: colors.bg }}
    >
      {firstSlide ? (
        <div className="w-full h-full flex flex-col justify-center p-3 relative overflow-hidden">
          {/* Decorative element */}
          <div
            className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-2xl opacity-20"
            style={{ background: colors.accent }}
          />
          <div className="absolute top-0 right-0 w-4 h-full opacity-10"
            style={{ background: colors.accent }} />

          <p className="text-[7px] font-bold leading-tight truncate" style={{ color: colors.text }}>
            {firstSlide.title || 'Untitled Slide'}
          </p>
          {firstSlide.subtitle && (
            <p className="text-[5px] leading-tight mt-0.5 opacity-70 truncate" style={{ color: colors.text }}>
              {firstSlide.subtitle}
            </p>
          )}
          {/* Content lines skeleton */}
          <div className="mt-2 space-y-1">
            {[1,2,3].map((i) => (
              <div
                key={i}
                className="h-[3px] rounded-full opacity-20"
                style={{ width: `${70 - i*10}%`, background: colors.accent }}
              />
            ))}
          </div>

          {/* Slide count badge */}
          {slides.length > 1 && (
            <div
              className="absolute top-1.5 right-1.5 text-[5px] font-bold px-1 py-0.5 rounded text-white"
              style={{ background: colors.accent }}
            >
              {slides.length} slides
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-[8px] text-gray-300 font-medium">No slides</div>
        </div>
      )}
    </div>
  );
}
