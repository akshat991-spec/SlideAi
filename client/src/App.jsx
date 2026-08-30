import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layouts
import AppLayout   from './components/layout/AppLayout.jsx';
import AuthLayout  from './components/layout/AuthLayout.jsx';

// Auth pages
import Login    from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// App pages
import Dashboard        from './pages/Dashboard.jsx';
import NewPresentation  from './pages/NewPresentation.jsx';
import Editor           from './pages/Editor/Editor.jsx';
import Preview          from './pages/Preview/Preview.jsx';
import Templates        from './pages/Templates.jsx';
import MyPresentations  from './pages/MyPresentations.jsx';
import Settings         from './pages/Settings.jsx';
import SharedView       from './pages/SharedView.jsx';
import NotFound         from './pages/NotFound.jsx';

// Loading screen shown while checking auth session
function SplashScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading SlideAI…</p>
      </div>
    </div>
  );
}

// Guard: redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

// Guard: redirects to /dashboard if already authenticated
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public share view ───────────────────────────── */}
      <Route path="/share/:shareId" element={<SharedView />} />

      {/* ── Auth routes ─────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<PublicRoute><Login    /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      </Route>

      {/* ── Protected app routes ─────────────────────────── */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index                               element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"                   element={<Dashboard />} />
        <Route path="/presentations"               element={<MyPresentations />} />
        <Route path="/presentations/new"           element={<NewPresentation />} />
        <Route path="/templates"                   element={<Templates />} />
        <Route path="/settings"                    element={<Settings />} />
      </Route>

      {/* ── Editor & Preview (full-screen, outside AppLayout) */}
      <Route path="/presentations/:id/edit"    element={<PrivateRoute><Editor /></PrivateRoute>} />
      <Route path="/presentations/:id/preview" element={<PrivateRoute><Preview /></PrivateRoute>} />

      {/* ── 404 ─────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
