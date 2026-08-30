import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { presentationService } from '../services/presentationService.js';
import { aiService } from '../services/aiService.js';
import { timeAgo, truncate } from '../utils/formatters.js';
import { SLIDE_COUNTS, PRESENTATION_TYPES, TONES, LANGUAGES } from '../utils/constants.js';
import { SkeletonCard } from '../components/shared/LoadingSpinner.jsx';
import SlideThumbnailPreview from '../components/dashboard/SlideThumbnailPreview.jsx';

const SELECT_CLASSES = "flex-1 min-w-0 text-sm border border-gray-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-700";

export default function Dashboard() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState('0');
  const [presType, setPresType] = useState('Pitch Deck');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English (US)');
  const [generating, setGenerating] = useState(false);

  const [recentPres, setRecentPres] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    presentationService.list({ limit: 4, sort: '-updatedAt' })
      .then((res) => setRecentPres(res.data.presentations || []))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return showError('Please enter a presentation prompt');
    setGenerating(true);
    try {
      const toastId = window._toastGenerate;
      const res = await presentationService.create({
        prompt: prompt.trim(),
        slideCount: parseInt(slideCount, 10),
        tone,
        language,
        presentationType: presType,
        title: presType + ' — ' + new Date().toLocaleDateString(),
      });
      const pres = res.data.presentation;
      showSuccess('Presentation created! Generating slides…');
      navigate(`/presentations/${pres._id}/edit`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create presentation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">What will you create today?</h1>
        <p className="text-gray-500 mt-1">Harness the power of AI to build compelling presentations in minutes.</p>
      </div>

      {/* Generation Prompt Card */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-semibold text-gray-700">Generation Prompt</span>
        </div>

        <textarea
          id="dashboard-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="input-base resize-none mb-4"
          placeholder="Describe the presentation you want to create in detail. E.g., 'A 10-slide pitch deck for a B2B SaaS startup focused on remote team productivity, emphasizing our AI-driven features and market growth.'"
        />

        {/* Config row */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select id="dashboard-slide-count" value={slideCount} onChange={(e) => setSlideCount(e.target.value)} className={SELECT_CLASSES}>
            {SLIDE_COUNTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select id="dashboard-pres-type" value={presType} onChange={(e) => setPresType(e.target.value)} className={SELECT_CLASSES}>
            {PRESENTATION_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select id="dashboard-tone" value={tone} onChange={(e) => setTone(e.target.value)} className={SELECT_CLASSES}>
            {TONES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select id="dashboard-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={SELECT_CLASSES}>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            id="dashboard-generate-btn"
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary px-6 py-2.5"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Presentation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Presentations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Presentations</h2>
          <button
            onClick={() => navigate('/presentations')}
            className="flex items-center gap-1 text-sm text-primary-700 hover:underline font-medium"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loadingRecent
            ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : recentPres.map((pres) => (
              <button
                key={pres._id}
                id={`recent-pres-${pres._id}`}
                onClick={() => navigate(`/presentations/${pres._id}/edit`)}
                className="card text-left hover:shadow-card-hover transition-shadow duration-150 overflow-hidden group"
              >
                <SlideThumbnailPreview slides={pres.slides} theme={pres.theme} />
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                    {pres.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Edited {timeAgo(pres.updatedAt)}
                  </p>
                </div>
              </button>
            ))
          }

          {/* Blank canvas CTA */}
          {!loadingRecent && (
            <button
              id="blank-canvas-btn"
              onClick={() => navigate('/presentations/new')}
              className="card flex flex-col items-center justify-center gap-3 p-6 border-dashed
                         hover:border-primary-300 hover:bg-primary-50 transition-all duration-150 min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100">
                <Plus className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Blank Canvas</p>
                <p className="text-xs text-gray-400">Start from scratch</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
