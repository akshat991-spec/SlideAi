import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,   // true during initial check
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':   return { ...state, loading: true, error: null };
    case 'SUCCESS':   return { user: action.payload, loading: false, error: null };
    case 'ERROR':     return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':    return { user: null, loading: false, error: null };
    default:          return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check session on mount
  useEffect(() => {
    authService.me()
      .then((res) => dispatch({ type: 'SUCCESS', payload: res.data.user }))
      .catch(() => dispatch({ type: 'LOGOUT' }));
  }, []);

  // Listen for global 401 events
  useEffect(() => {
    const handle = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth:unauthorized', handle);
    return () => window.removeEventListener('auth:unauthorized', handle);
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOADING' });
    const res = await authService.login(credentials);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SUCCESS', payload: res.data.user });
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    dispatch({ type: 'LOADING' });
    const res = await authService.register(data);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SUCCESS', payload: res.data.user });
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    await authService.logout().catch(() => {});
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'SUCCESS', payload: userData });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
