import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Link as LinkIcon, Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { presentationService } from '../services/presentationService.js';
import { uploadService } from '../services/uploadService.js';
import {
  AUDIENCES, PURPOSES, TONES, VISUAL_STYLES, COLOR_THEMES,
  LANGUAGES, SLIDE_COUNTS, PRESENTATION_TYPES,
} from '../utils/constants.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

const GENERATION_STEPS = [
  'Analyzing presentation objectives & audience...',
  'Planning narrative arc & structure...',
  'Synthesizing slide content with Gemini AI...',
  'Designing visual layouts & themes...',
  'Validating presentation quality & data...',
  'Building PowerPoint deck (.pptx)...',
];

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div className="flex-1">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-gray-700"
      >
        {options.map((o) => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NewPresentation() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const fileInputRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [presentationType, setPresentationType] = useState('Pitch Deck');
  const [generationMode, setGenerationMode] = useState('Auto');
  const [slideCount, setSlideCount] = useState(0);
  const [audience, setAudience] = useState('Executives');
  const [purpose, setPurpose] = useState('Inform');
  const [tone, setTone] = useState('Professional');
  const [visualStyle, setVisualStyle] = useState('Minimal');
  const [language, setLanguage] = useState('English (US)');
  const [colorTheme, setColorTheme] = useState('indigo');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // Animate generation steps while backend processes
  useEffect(() => {
    let interval;
    if (generating) {
      setCurrentStepIdx(0);
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only PDF, DOCX, TXT allowed';
    if (file.size > MAX_FILE_SIZE) return 'File size must be under 10MB';
    return null;
  };

  const handleFiles = (newFiles) => {
    const valid = [];
    for (const f of newFiles) {
      const err = validateFile(f);
      if (err) { showError(`${f.name}: ${err}`); continue; }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleGenerate = async () => {
    if (!prompt.trim()) return showError('Please describe your presentation');
    setGenerating(true);

    try {
      // Upload files first if any and gather text
      const fileIds = [];
      let combinedNotes = '';
      for (const f of files) {
        const res = await uploadService.upload(f);
        fileIds.push(res.data.fileId);
        if (res.data.text) {
          combinedNotes += `\n--- Document: ${f.name} ---\n${res.data.text}\n`;
        }
      }

      const presRes = await presentationService.create({
        prompt: prompt.trim(),
        title: title.trim() || undefined,
        presentationType,
        generationMode,
        slideCount: Number(slideCount),
        audience,
        purpose,
        tone,
        visualStyle,
        language,
        colorTheme,
        referenceUrl: referenceUrl.trim() || undefined,
        fileIds,
        notesText: combinedNotes.trim() || undefined,
      });

      showSuccess('Presentation generated successfully!');
      navigate(`/presentations/${presRes.data.presentation._id}/edit`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create presentation');
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Generation Progress Modal */}
      {generating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Architecting Presentation</h3>
            <p className="text-xs text-gray-500 mb-6">Powered by Google Gemini Presentation Agent</p>

            <div className="space-y-3 text-left">
              {GENERATION_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition-all duration-300 p-2 rounded-lg ${
                      isCurrent
                        ? 'bg-primary-50 text-primary-800 font-medium'
                        : isPast
                        ? 'text-gray-600'
                        : 'text-gray-300'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-primary-600 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Presentation Generator</h1>
            <p className="text-xs text-gray-500">Presentation Architect & Storytelling Framework</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Core Idea */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <h2 className="text-sm font-semibold text-gray-700">Presentation Core Idea</h2>
            </div>

            <div className="mb-1">
              <label className="text-xs text-gray-500 mb-1 block">Topic and Detailed Instructions</label>
              <div className="relative">
                <textarea
                  id="new-pres-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={3000}
                  rows={7}
                  className="input-base resize-none pr-8 text-sm leading-relaxed"
                  placeholder="Describe what you want to present in detail. E.g., 'A modern pitch deck for an AI-powered logistics SaaS platform targeting enterprise supply chain directors...'"
                />
                <Sparkles className="absolute bottom-3 right-3 w-4 h-4 text-gray-300" />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">{prompt.length} / 3000 characters</p>
            </div>
          </div>

          {/* Bottom row: Source Documents & Reference URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Source Documents (NotebookLM Mode) */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Source Notes / Docs</h3>
              </div>

              <div
                id="file-drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                  ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                <p className="text-xs text-gray-600 font-medium">Click or drag research files here</p>
                <p className="text-[11px] text-gray-400 mt-0.5">PDF, DOCX, TXT (Grounding Context)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFiles(Array.from(e.target.files))}
              />

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-gray-700 truncate">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="ml-2 text-gray-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reference URL */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Reference URL</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Provide a website or article link to ground the AI presentation in specific factual context.
              </p>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  id="reference-url"
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="input-base pl-9 text-xs"
                  placeholder="https://example.com/report"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Configuration Panel */}
        <div className="card p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Presentation Configuration</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Presentation Title (Optional)</label>
            <input
              id="pres-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base text-xs"
              placeholder="e.g., Enterprise Logistics Pitch"
            />
          </div>

          <SelectField
            id="pres-type"
            label="Presentation Type"
            value={presentationType}
            onChange={setPresentationType}
            options={PRESENTATION_TYPES}
          />

          <div className="flex gap-3">
            <SelectField
              id="pres-mode"
              label="Slide Count"
              value={slideCount}
              onChange={(val) => {
                setSlideCount(val);
                setGenerationMode(val === 0 ? 'Auto' : 'Fixed');
              }}
              options={SLIDE_COUNTS}
            />
            <SelectField
              id="pres-language"
              label="Language"
              value={language}
              onChange={setLanguage}
              options={LANGUAGES}
            />
          </div>

          <div className="flex gap-3">
            <SelectField id="pres-audience" label="Audience" value={audience} onChange={setAudience} options={AUDIENCES} />
            <SelectField id="pres-purpose"  label="Purpose"  value={purpose}  onChange={setPurpose}  options={PURPOSES}   />
          </div>

          <div className="flex gap-3">
            <SelectField id="pres-tone" label="Tone / Style" value={tone} onChange={setTone} options={TONES} />
            <SelectField id="pres-visual-style" label="Visual Layout" value={visualStyle} onChange={setVisualStyle} options={VISUAL_STYLES} />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Color Palette</label>
            <select
              id="pres-color-theme"
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-gray-700"
            >
              {COLOR_THEMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <button
            id="generate-presentation-btn"
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary w-full py-3 text-sm mt-2 shadow-md hover:shadow-lg transition-all"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Presentation…
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
    </div>
  );
}
