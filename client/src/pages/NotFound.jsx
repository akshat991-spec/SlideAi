import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Layers } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8 text-primary-700" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">404</h1>
        <p className="text-lg text-gray-600">Page not found</p>
        <p className="text-sm text-gray-400">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-2">
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
