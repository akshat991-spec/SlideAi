import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, Trash2, Clock, Filter, Grid, List } from 'lucide-react';
import { presentationService } from '../services/presentationService.js';
import { useToast } from '../context/ToastContext.jsx';
import { timeAgo, truncate } from '../utils/formatters.js';
import { SkeletonCard } from '../components/shared/LoadingSpinner.jsx';
import SlideThumbnailPreview from '../components/dashboard/SlideThumbnailPreview.jsx';

export default function MyPresentations() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [deleting, setDeleting] = useState(null);

  const fetchPresentations = async () => {
    setLoading(true);
    try {
      const params = { sort: '-updatedAt', limit: 50 };
      if (search) params.search = search;
      if (favoritesOnly) params.favorite = true;
      const res = await presentationService.list(params);
      setPresentations(res.data.presentations || []);
    } catch {
      showError('Failed to load presentations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPresentations(); }, [search, favoritesOnly]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this presentation?')) return;
    setDeleting(id);
    try {
      await presentationService.delete(id);
      setPresentations((prev) => prev.filter((p) => p._id !== id));
      showSuccess('Presentation deleted');
    } catch {
      showError('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await presentationService.toggleFavorite(id);
      setPresentations((prev) =>
        prev.map((p) => p._id === id ? { ...p, isFavorite: res.data.isFavorite } : p)
      );
    } catch {
      showError('Failed to update favorite');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Presentations</h1>
          <p className="text-gray-500 text-sm mt-0.5">{presentations.length} presentation{presentations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/presentations/new')}
          className="btn-primary"
          id="new-presentation-btn"
        >
          <Plus className="w-4 h-4" /> New Presentation
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search-presentations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search presentations…"
            className="w-full pl-9 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>

        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`filter-pill ${favoritesOnly ? 'active' : ''}`}
          id="favorites-filter"
        >
          <Star className="w-3.5 h-3.5 mr-1" /> Favorites
        </button>

        <div className="ml-auto flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid/List View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : presentations.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Filter className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No presentations found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {search || favoritesOnly ? 'Try adjusting your filters' : 'Create your first presentation to get started'}
          </p>
          <button onClick={() => navigate('/presentations/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> New Presentation
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {presentations.map((pres) => (
            <div
              key={pres._id}
              id={`pres-card-${pres._id}`}
              onClick={() => navigate(`/presentations/${pres._id}/edit`)}
              className="card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow duration-150 group"
            >
              <SlideThumbnailPreview slides={pres.slides} theme={pres.theme} />
              <div className="p-3 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                    {pres.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(pres.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleFavorite(pres._id, e)}
                    className="p-1 rounded hover:bg-gray-100"
                    title="Toggle favorite"
                  >
                    <Star className={`w-3.5 h-3.5 ${pres.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(pres._id, e)}
                    disabled={deleting === pres._id}
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {presentations.map((pres) => (
            <div
              key={pres._id}
              onClick={() => navigate(`/presentations/${pres._id}/edit`)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 group transition-colors"
            >
              <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <SlideThumbnailPreview slides={pres.slides} theme={pres.theme} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                  {pres.title}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Edited {timeAgo(pres.updatedAt)} · {pres.slides?.length || 0} slides
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleFavorite(pres._id, e)} className="p-1.5 rounded hover:bg-gray-100">
                  <Star className={`w-4 h-4 ${pres.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                </button>
                <button onClick={(e) => handleDelete(pres._id, e)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
