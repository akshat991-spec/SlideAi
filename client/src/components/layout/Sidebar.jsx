import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, LayoutTemplate, Sparkles, Settings, Plus, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getInitials } from '../../utils/formatters.js';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/presentations', icon: FolderOpen, label: 'My Presentations' },
  { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/presentations/new', icon: Sparkles, label: 'AI Generator' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 w-[200px] bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">SlideAI</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Premium Suite</p>
          </div>
        </div>
      </div>

      {/* New Presentation */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => navigate('/presentations/new')}
          className="btn-primary w-full"
        >
          <Plus className="w-4 h-4" />
          New Presentation
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-100 p-3 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1">
            <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="text-[10px] font-semibold text-white">{getInitials(user.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400">Pro Plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
