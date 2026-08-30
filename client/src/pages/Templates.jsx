import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../utils/constants.js';
import { presentationService } from '../services/presentationService.js';
import { useToast } from '../context/ToastContext.jsx';

function TemplateCard({ template, onUse }) {
  return (
    <div
      id={`template-${template.id}`}
      className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-all duration-200 group"
      onClick={() => onUse(template)}
    >
      {/* Preview area */}
      <div
        className="w-full h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: `${template.color}18` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 60% 40%, ${template.color}, transparent 70%)` }}
        />
        {/* Mini slide preview */}
        <div className="w-40 h-28 bg-white rounded-lg shadow-md border border-gray-100 p-3 flex flex-col gap-2">
          <div className="h-2.5 rounded w-3/4" style={{ background: template.color }} />
          <div className="h-1.5 rounded w-1/2 bg-gray-200" />
          <div className="flex-1 flex flex-col gap-1.5 mt-1">
            {[0.8, 0.6, 0.7].map((w, i) => (
              <div key={i} className="h-1 rounded" style={{ width: `${w * 100}%`, background: `${template.color}40` }} />
            ))}
          </div>
          <div className="text-[6px] font-bold" style={{ color: template.color }}>
            {template.category.toUpperCase()}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-xs font-semibold text-gray-900 px-3 py-1.5 rounded-lg shadow-sm">
            Use Template
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
            {template.name}
          </h3>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
            style={{ background: `${template.color}18`, color: template.color }}
          >
            {template.category}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
        <p className="text-xs text-gray-400 mt-2">{template.slideCount} slides</p>
      </div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUseTemplate = async (template) => {
    setCreating(template.id);
    try {
      const res = await presentationService.create({
        prompt: template.defaultPrompt,
        title: template.name,
        presentationType: template.category === 'Finance' ? 'Annual Report' : 'Pitch Deck',
        tone: 'Professional',
        slideCount: template.slideCount,
        colorTheme: 'indigo',
      });
      showSuccess(`Creating "${template.name}"…`);
      navigate(`/presentations/${res.data.presentation._id}/edit`);
    } catch {
      showError('Failed to create presentation from template');
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Presentation Templates</h1>
        <p className="text-gray-500 text-sm mt-1">Start with a professional foundation for your next big idea.</p>
      </div>

      {/* Search + Categories */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="template-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="pl-9 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white w-48"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-base font-medium">No templates match your search</p>
          <p className="text-sm mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((template) => (
            <div key={template.id} className="relative">
              {creating === template.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-primary-700">
                    <div className="w-4 h-4 rounded-full border-2 border-primary-300 border-t-primary-700 animate-spin" />
                    Creating…
                  </div>
                </div>
              )}
              <TemplateCard template={template} onUse={handleUseTemplate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
