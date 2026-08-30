import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext.jsx';
import { presentationService } from '../../services/presentationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useParams } from 'react-router-dom';
import {
  ChevronDown, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, List, Palette, Layout
} from 'lucide-react';

const LAYOUTS = [
  { value: 'title',       label: 'Title Slide' },
  { value: 'content',     label: 'Content' },
  { value: 'two-column',  label: 'Two Column' },
  { value: 'image-left',  label: 'Image Left' },
  { value: 'image-right', label: 'Image Right' },
  { value: 'blank',       label: 'Blank' },
  { value: 'chart',       label: 'Chart' },
];

export default function PropertiesPanel() {
  const { selectedSlide, selectedSlideIndex, dispatch, presentation } = useEditor();
  const { showError } = useToast();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);

  if (!selectedSlide) {
    return (
      <aside className="w-[260px] flex-shrink-0 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-xs text-gray-400 text-center px-4">Select a slide to edit its properties</p>
      </aside>
    );
  }

  const update = (field, value) => {
    dispatch({ type: 'UPDATE_SLIDE', index: selectedSlideIndex, payload: { [field]: value } });
  };

  const updateBullet = (bulletIndex, value) => {
    const bullets = [...(selectedSlide.bullets || [])];
    bullets[bulletIndex] = value;
    update('bullets', bullets);
  };

  const addBullet = () => {
    update('bullets', [...(selectedSlide.bullets || []), '']);
  };

  const removeBullet = (i) => {
    update('bullets', (selectedSlide.bullets || []).filter((_, idx) => idx !== i));
  };

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Properties</h3>
      </div>

      <div className="p-4 space-y-5">
        {/* Layout */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            <Layout className="w-3 h-3 inline mr-1" /> Layout
          </label>
          <select
            value={selectedSlide.layout || 'content'}
            onChange={(e) => update('layout', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-gray-700"
          >
            {LAYOUTS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            <Type className="w-3 h-3 inline mr-1" /> Title
          </label>
          <input
            value={selectedSlide.title || ''}
            onChange={(e) => update('title', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Slide title"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Subtitle</label>
          <input
            value={selectedSlide.subtitle || ''}
            onChange={(e) => update('subtitle', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="Optional subtitle"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Body Content</label>
          <textarea
            value={selectedSlide.content || ''}
            onChange={(e) => update('content', e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="Add body text..."
          />
        </div>

        {/* Bullets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-500">
              <List className="w-3 h-3 inline mr-1" /> Bullet Points
            </label>
            <button
              onClick={addBullet}
              className="text-xs text-primary-700 hover:text-primary-900 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1.5">
            {(selectedSlide.bullets || []).map((b, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  value={b}
                  onChange={(e) => updateBullet(i, e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder={`Bullet ${i + 1}`}
                />
                <button
                  onClick={() => removeBullet(i)}
                  className="text-gray-300 hover:text-red-500 px-1"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Speaker Notes */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Speaker Notes</label>
          <textarea
            value={selectedSlide.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="Notes for the presenter..."
          />
        </div>
      </div>
    </aside>
  );
}
