import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Link as LinkIcon, Upload, X, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { presentationService } from '../services/presentationService.js';
import { uploadService } from '../services/uploadService.js';
import {
  AUDIENCES, PURPOSES, TONES, VISUAL_STYLES, COLOR_THEMES,
} from '../utils/constants.js';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const ALLOWED_EXT  = ['.pdf', '.docx', '.txt'];

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
  const [audience, setAudience] = useState('Executives');
  const [purpose, setPurpose] = useState('Inform');
  const [tone, setTone] = useState('Professional');
  const [visualStyle, setVisualStyle] = useState('Minimal');
  const [colorTheme, setColorTheme] = useState('indigo');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadedFileIds, setUploadedFileIds] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
        audience,
        purpose,
        tone,
        visualStyle,
        colorTheme,
        referenceUrl: referenceUrl.trim() || undefined,
        fileIds,
        notesText: combinedNotes.trim() || undefined,
      });

      showSuccess('Generating your presentation…');
      navigate(`/presentations/${presRes.data.presentation._id}/edit`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create presentation');
    } finally {
      setGenerating(false);
    }
  };

  const selectedTheme = COLOR_THEMES.find((t) => t.value === colorTheme);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">AI Presentation Generator</h1>
        </div>
        <button className="btn-secondary" id="save-draft-btn">
          <FileText className="w-4 h-4" /> Save Draft
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left */}
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
                  maxLength={2000}
                  rows={7}
                  className="input-base resize-none pr-8"
                  placeholder="Describe what you want to present. E.g., 'A Q3 financial review for the board focusing on SaaS revenue growth and our new enterprise acquisition strategy...'"
                />
                <Sparkles className="absolute bottom-3 right-3 w-4 h-4 text-gray-300" />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">{prompt.length} / 2000 characters</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Source Documents */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Source Documents</h3>
              </div>

              <div
                id="file-drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                  ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click or drag files here</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, TXT (Max 10MB)</p>
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
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
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
                Provide a link to a website, article, or online document to ground the AI in specific facts.
              </p>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  id="reference-url"
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="input-base pl-9"
                  placeholder="https://example.com/report"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Configuration */}
        <div className="card p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-gray-900">Configuration</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Presentation Title</label>
            <input
              id="pres-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base"
              placeholder="e.g., Q3 Financial Review"
            />
          </div>

          <div className="flex gap-3">
            <SelectField id="pres-audience" label="Audience" value={audience} onChange={setAudience} options={AUDIENCES} />
            <SelectField id="pres-purpose"  label="Purpose"  value={purpose}  onChange={setPurpose}  options={PURPOSES}   />
          </div>

          <SelectField id="pres-tone" label="Tone" value={tone} onChange={setTone} options={TONES} />

          <SelectField id="pres-visual-style" label="Visual Style" value={visualStyle} onChange={setVisualStyle} options={VISUAL_STYLES} />

          <div>
            <label className="block text-xs text-gray-500 mb-1">Color Theme</label>
            <select
              id="pres-color-theme"
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-gray-700"
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
            className="btn-primary w-full py-3 text-base"
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
    </div>
  );
}
