import React from 'react';
import { useEditor } from '../../context/EditorContext.jsx';
import {
  Type, List, Layout, Sparkles, Image as ImageIcon,
  Zap, TrendingUp, Clock, Plus, Trash2
} from 'lucide-react';

const LAYOUTS = [
  { value: 'title',       label: '👑 Hero Title Slide' },
  { value: 'infographic', label: '📊 Infographic (Pillars / Framework)' },
  { value: 'stats',       label: '📈 KPI / Stats Highlights' },
  { value: 'image-right', label: '🖼️ Image Right' },
  { value: 'image-left',  label: '🖼️ Image Left' },
  { value: 'chart',       label: '📊 Data Analytics Chart' },
  { value: 'timeline',    label: '⏱️ Timeline / Process' },
  { value: 'two-column',  label: '⚖️ Two-Column Comparison' },
  { value: 'content',     label: '📄 Standard Executive Content' },
];

export default function PropertiesPanel() {
  const { selectedSlide, selectedSlideIndex, dispatch } = useEditor();

  if (!selectedSlide) {
    return (
      <aside className="w-[280px] flex-shrink-0 bg-white border-l border-gray-200 flex items-center justify-center p-4">
        <p className="text-xs text-gray-400 text-center">Select a slide to edit its visual properties</p>
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

  const updateInfographicItem = (itemIdx, field, val) => {
    const items = [...(selectedSlide.infographicData || [
      { step: 1, title: 'Pillar 01', description: 'Core feature detail.', value: '01' },
      { step: 2, title: 'Pillar 02', description: 'Core feature detail.', value: '02' },
      { step: 3, title: 'Pillar 03', description: 'Core feature detail.', value: '03' },
    ])];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    update('infographicData', items);
  };

  const updateMetric = (metricIdx, field, val) => {
    const metrics = [...(selectedSlide.metrics || [
      { label: 'Growth', value: '+45%' },
      { label: 'Savings', value: '$2.4M' },
    ])];
    metrics[metricIdx] = { ...metrics[metricIdx], [field]: val };
    update('metrics', metrics);
  };

  const layout = selectedSlide.layout || 'content';

  return (
    <aside className="w-[280px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Slide Properties</h3>
        <span className="text-[10px] bg-primary-50 text-primary-700 font-semibold px-2 py-0.5 rounded">
          Slide #{selectedSlideIndex + 1}
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* Layout Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
            <Layout className="w-3.5 h-3.5 text-primary-600" /> Visual Layout Style
          </label>
          <select
            value={layout}
            onChange={(e) => update('layout', e.target.value)}
            className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-gray-800 shadow-xs"
          >
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            <Type className="w-3 h-3 inline mr-1" /> Slide Title
          </label>
          <input
            value={selectedSlide.title || ''}
            onChange={(e) => update('title', e.target.value)}
            className="input-base text-xs font-semibold"
            placeholder="Slide title"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Subtitle</label>
          <input
            value={selectedSlide.subtitle || ''}
            onChange={(e) => update('subtitle', e.target.value)}
            className="input-base text-xs"
            placeholder="Optional subtitle"
          />
        </div>

        {/* Infographic Editor */}
        {layout === 'infographic' && (
          <div className="bg-primary-50/50 rounded-xl p-3 border border-primary-100 space-y-3">
            <div className="flex items-center gap-1 text-xs font-bold text-primary-900">
              <Zap className="w-3.5 h-3.5 text-primary-600" /> Infographic Pillars
            </div>
            {(selectedSlide.infographicData?.length ? selectedSlide.infographicData : [
              { title: 'Intelligent Telemetry', description: 'Real-time telemetry and edge data synthesis.', value: '01' },
              { title: 'Autonomous Engine', description: 'Self-optimizing execution feedback loops.', value: '02' },
              { title: 'Enterprise Scaling', description: 'Zero-downtime microservice architecture.', value: '03' },
            ]).map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-2.5 border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                <div className="flex gap-1.5">
                  <input
                    value={item.value || `0${idx + 1}`}
                    onChange={(e) => updateInfographicItem(idx, 'value', e.target.value)}
                    className="w-16 border rounded px-1.5 py-0.5 text-[11px] font-bold text-primary-700 bg-gray-50"
                    placeholder="Badge"
                  />
                  <input
                    value={item.title || ''}
                    onChange={(e) => updateInfographicItem(idx, 'title', e.target.value)}
                    className="flex-1 border rounded px-1.5 py-0.5 text-xs font-semibold"
                    placeholder="Pillar Title"
                  />
                </div>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateInfographicItem(idx, 'description', e.target.value)}
                  rows={2}
                  className="w-full border rounded px-1.5 py-1 text-[11px] resize-none text-gray-600"
                  placeholder="Pillar description..."
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats / KPI Editor */}
        {layout === 'stats' && (
          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 space-y-3">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> KPI Metric Cards
            </div>
            {(selectedSlide.metrics?.length ? selectedSlide.metrics : [
              { label: 'Efficiency Gain', value: '+45%' },
              { label: 'Annual Savings', value: '$2.4M' },
              { label: 'User Satisfaction', value: '98%' },
            ]).slice(0, 3).map((m, idx) => (
              <div key={idx} className="bg-white rounded-lg p-2.5 border border-gray-200 text-xs flex gap-2 shadow-2xs">
                <input
                  value={m.value || ''}
                  onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                  className="w-20 border rounded px-2 py-1 text-xs font-bold text-primary-700"
                  placeholder="+45%"
                />
                <input
                  value={m.label || ''}
                  onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-xs text-gray-700"
                  placeholder="Metric Label"
                />
              </div>
            ))}
          </div>
        )}

        {/* Image Controls (for image-left / image-right) */}
        {(layout === 'image-left' || layout === 'image-right') && (
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 space-y-2">
            <div className="flex items-center gap-1 text-xs font-bold text-blue-900">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Photo Settings
            </div>
            <label className="text-[11px] text-gray-500 block">Image URL / Generator Source</label>
            <input
              value={selectedSlide.imageUrl || ''}
              onChange={(e) => update('imageUrl', e.target.value)}
              className="input-base text-xs"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        )}

        {/* Body Content */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Executive Summary Text</label>
          <textarea
            value={selectedSlide.content || ''}
            onChange={(e) => update('content', e.target.value)}
            rows={2}
            className="input-base text-xs resize-none"
            placeholder="Add 1-2 sentence executive takeaway..."
          />
        </div>

        {/* Bullets */}
        {layout !== 'infographic' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <List className="w-3 h-3 text-gray-500" /> Bullet Points
              </label>
              <button
                onClick={addBullet}
                className="text-xs text-primary-700 hover:text-primary-900 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {(selectedSlide.bullets || []).map((b, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    value={b}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    className="flex-1 input-base text-xs py-1.5"
                    placeholder={`**Key Point:** description`}
                  />
                  <button
                    onClick={() => removeBullet(i)}
                    className="text-gray-300 hover:text-red-500 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Speaker Notes */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Presenter Speaker Notes</label>
          <textarea
            value={selectedSlide.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            className="input-base text-xs resize-none"
            placeholder="Talking points and presenter guidance..."
          />
        </div>
      </div>
    </aside>
  );
}
