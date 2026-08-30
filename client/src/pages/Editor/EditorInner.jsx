import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Undo2, Redo2, Plus, Layout, Sparkles, Play, Download,
  ChevronDown, Save, Check, AlertCircle, Layers
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext.jsx';
import { aiService } from '../../services/aiService.js';
import { presentationService } from '../../services/presentationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import SlidePanel from '../../components/editor/SlidePanel.jsx';
import SlideCanvas from '../../components/editor/SlideCanvas.jsx';
import PropertiesPanel from '../../components/editor/PropertiesPanel.jsx';
import AIAssistant from '../../components/editor/AIAssistant.jsx';

function SaveIndicator({ status }) {
  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <div className="w-3 h-3 rounded-full border border-gray-300 border-t-primary-500 animate-spin" />
      Saving…
    </span>
  );
  if (status === 'saved') return (
    <span className="flex items-center gap-1.5 text-xs text-green-600">
      <Check className="w-3 h-3" /> Saved
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1.5 text-xs text-red-500">
      <AlertCircle className="w-3 h-3" /> Unable to save
    </span>
  );
  return null;
}

export default function EditorInner({ initialPresentation }) {
  const { loadPresentation, presentation, dispatch, saveStatus, canUndo, canRedo, selectedSlideIndex } = useEditor();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [aiOpen, setAiOpen] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleVal, setTitleVal] = useState(initialPresentation?.title || '');

  useEffect(() => {
    loadPresentation(initialPresentation);
    setTitleVal(initialPresentation?.title || '');
  }, [initialPresentation]);

  const handleAddSlide = async () => {
    try {
      const res = await presentationService.addSlide(id, {
        title: 'New Slide',
        content: '',
        layout: 'content',
      });
      dispatch({ type: 'ADD_SLIDE', payload: res.data.slide });
    } catch {
      showError('Failed to add slide');
    }
  };

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleRedo = () => dispatch({ type: 'REDO' });

  const handleTitleSave = () => {
    if (titleVal.trim()) {
      dispatch({ type: 'UPDATE_PRESENTATION', payload: { title: titleVal.trim() } });
    }
    setTitleEdit(false);
  };

  const handleExport = async (format) => {
    try {
      const res = format === 'pdf'
        ? await presentationService.exportPdf(id)
        : await presentationService.exportPptx(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentation?.title || 'presentation'}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showError('Export failed. Please try again.');
    }
  };

  if (!presentation) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col" style={{ zIndex: 100 }}>
      {/* Top toolbar */}
      <div className="h-[52px] bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-6 h-6 rounded bg-primary-700 flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-900 hidden sm:block">SlideAI</span>
        </div>

        {/* Title */}
        {titleEdit ? (
          <input
            autoFocus
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
            className="text-sm font-semibold border-b border-primary-500 focus:outline-none bg-transparent w-48"
          />
        ) : (
          <button
            id="editor-title"
            onClick={() => setTitleEdit(true)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-gray-600"
          >
            {presentation.title}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Undo/Redo */}
        <button id="undo-btn" onClick={handleUndo} disabled={!canUndo} className="btn-ghost p-2 disabled:opacity-30" title="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button id="redo-btn" onClick={handleRedo} disabled={!canRedo} className="btn-ghost p-2 disabled:opacity-30" title="Redo">
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Add Slide */}
        <button id="add-slide-btn" onClick={handleAddSlide} className="btn-ghost text-sm gap-1.5">
          <Plus className="w-4 h-4" /> Add Slide
        </button>

        <button className="btn-ghost text-sm gap-1.5">
          <Layout className="w-4 h-4" /> Layout
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save status */}
        <SaveIndicator status={saveStatus} />

        {/* AI Assistant */}
        <button
          id="ai-assistant-btn"
          onClick={() => setAiOpen(true)}
          className="btn-secondary text-sm gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-600" /> AI Assistant
        </button>

        {/* Preview */}
        <button
          id="preview-btn"
          onClick={() => navigate(`/presentations/${id}/preview`)}
          className="btn-secondary text-sm gap-1.5"
        >
          <Play className="w-3.5 h-3.5" /> Preview
        </button>

        {/* Export */}
        <div className="relative group">
          <button id="export-btn" className="btn-primary text-sm gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-modal border border-gray-100 py-1 hidden group-hover:block z-50">
            <button onClick={() => handleExport('pdf')}  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Export PDF</button>
            <button onClick={() => handleExport('pptx')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Export PPTX</button>
          </div>
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Slide panel */}
        <SlidePanel />

        {/* Center: Canvas */}
        <SlideCanvas />

        {/* Right: Properties panel */}
        <PropertiesPanel />
      </div>

      {/* AI Assistant modal */}
      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}
    </div>
  );
}
