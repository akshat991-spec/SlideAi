import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-white leading-none">SlideAI</p>
              <p className="text-xs text-white/60 mt-0.5">Premium Suite</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-modal p-8">
          <Outlet />
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} SlideAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
