import React, { useState } from 'react';
import { User, Lock, Bell, Palette, LogOut, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authService } from '../services/authService.js';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-700" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) return showError('Name cannot be empty');
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      updateUser(res.data.user);
      showSuccess('Profile updated');
    } catch {
      showError('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showError('All password fields are required');
    }
    if (newPassword !== confirmPassword) return showError('Passwords do not match');
    if (newPassword.length < 6) return showError('Password must be at least 6 characters');

    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      showSuccess('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-white">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                {user?.plan || 'Free'} Plan
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Display Name</label>
            <input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="input-base bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          <button
            id="save-profile-btn"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="btn-primary"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={Lock}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
              placeholder="Repeat password"
            />
          </div>
          <button
            id="change-password-btn"
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="btn-primary"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Account" icon={LogOut}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Sign out</p>
            <p className="text-xs text-gray-500">Sign out of your account on this device</p>
          </div>
          <button
            id="logout-btn"
            onClick={logout}
            className="btn-danger"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </Section>
    </div>
  );
}
