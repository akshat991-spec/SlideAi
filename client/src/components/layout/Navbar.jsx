import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getInitials } from '../../utils/formatters.js';

export default function Navbar({ searchPlaceholder = 'Search presentations, templates...' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/presentations?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="fixed top-0 left-[200px] right-0 h-[57px] bg-white border-b border-gray-200 flex items-center px-6 gap-4 z-10">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full
                       focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                       placeholder:text-gray-400 transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help */}
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Avatar / Menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary-300 transition-all"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-700 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">{getInitials(user?.name || 'U')}</span>
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-modal border border-gray-100 py-1 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
