import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useEditor } from '../../context/EditorContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useParams } from 'react-router-dom';
import { AI_IMPROVE_ACTIONS } from '../../utils/constants.js';
import api from '../../services/api.js';

export default function AIAssistant({ onClose }) {
  const { selectedSlide, selectedSlideIndex, dispatch, presentation } = useEditor();
  const { showError, showSuccess } = useToast();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState('');

  const applyAction = async (instruction) => {
    if (!selectedSlide) return showError('Select a slide first');
    setLoading(true);
    try {
      const res = await api.post(`/presentations/${id}/ai/enhance-slide`, {
        slideId: selectedSlide._id,
        instruction,
      });
      dispatch({
        type: 'UPDATE_SLIDE',
        index: selectedSlideIndex,
        payload: res.data.slide,
      });
      showSuccess('Slide enhanced by AI ✨');
    } catch {
      showError('AI enhancement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-400">Enhance your current slide</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Quick actions */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {AI_IMPROVE_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => applyAction(action.label)}
                  disabled={loading}
                  className="text-left text-sm px-3 py-2.5 rounded-xl border border-gray-200
                             hover:border-primary-300 hover:bg-primary-50 transition-all duration-150
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-1.5">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom instruction */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Custom Instruction</p>
            <div className="flex gap-2">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && custom.trim()) applyAction(custom); }}
                placeholder="e.g. Add a chart suggestion"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                disabled={loading}
              />
              <button
                onClick={() => custom.trim() && applyAction(custom)}
                disabled={loading || !custom.trim()}
                className="btn-primary px-3 py-2.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is enhancing your slide…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
