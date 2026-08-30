import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { presentationService } from '../services/presentationService.js';

const EditorContext = createContext(null);

const SAVE_DELAY = 1500; // debounce ms

const initialState = {
  presentation: null,
  selectedSlideIndex: 0,
  saveStatus: 'saved', // 'saved' | 'saving' | 'error'
  isDirty: false,
  history: [],
  historyIndex: -1,
};

function editorReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        presentation: action.payload,
        selectedSlideIndex: 0,
        saveStatus: 'saved',
        isDirty: false,
        history: [action.payload],
        historyIndex: 0,
      };

    case 'UPDATE_PRESENTATION': {
      const updated = { ...state.presentation, ...action.payload };
      const newHistory = state.history.slice(0, state.historyIndex + 1).concat(updated);
      return {
        ...state,
        presentation: updated,
        isDirty: true,
        saveStatus: 'saving',
        history: newHistory.slice(-50), // keep last 50 snapshots
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'UPDATE_SLIDE': {
      const slides = state.presentation.slides.map((s, i) =>
        i === action.index ? { ...s, ...action.payload } : s
      );
      const updated = { ...state.presentation, slides };
      const newHistory = state.history.slice(0, state.historyIndex + 1).concat(updated);
      return {
        ...state,
        presentation: updated,
        isDirty: true,
        saveStatus: 'saving',
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    }

    case 'ADD_SLIDE': {
      const slides = [...state.presentation.slides, action.payload];
      const updated = { ...state.presentation, slides };
      return {
        ...state,
        presentation: updated,
        selectedSlideIndex: slides.length - 1,
        isDirty: true,
        saveStatus: 'saving',
      };
    }

    case 'DELETE_SLIDE': {
      const slides = state.presentation.slides.filter((_, i) => i !== action.index);
      const newIndex = Math.min(state.selectedSlideIndex, slides.length - 1);
      const updated = { ...state.presentation, slides };
      return {
        ...state,
        presentation: updated,
        selectedSlideIndex: Math.max(0, newIndex),
        isDirty: true,
        saveStatus: 'saving',
      };
    }

    case 'REORDER_SLIDES': {
      const slides = [...action.payload];
      const updated = { ...state.presentation, slides };
      return { ...state, presentation: updated, isDirty: true, saveStatus: 'saving' };
    }

    case 'SELECT_SLIDE':
      return { ...state, selectedSlideIndex: action.index };

    case 'SAVE_STATUS':
      return { ...state, saveStatus: action.status, isDirty: action.status === 'error' ? true : false };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return { ...state, presentation: state.history[newIndex], historyIndex: newIndex, isDirty: true };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { ...state, presentation: state.history[newIndex], historyIndex: newIndex, isDirty: true };
    }

    default:
      return state;
  }
}

export function EditorProvider({ children, presentationId }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const saveTimerRef = useRef(null);

  // Auto-save with debounce
  useEffect(() => {
    if (!state.isDirty || !state.presentation?._id) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await presentationService.update(state.presentation._id, {
          title: state.presentation.title,
          slides: state.presentation.slides,
          theme: state.presentation.theme,
        });
        dispatch({ type: 'SAVE_STATUS', status: 'saved' });
      } catch {
        dispatch({ type: 'SAVE_STATUS', status: 'error' });
      }
    }, SAVE_DELAY);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state.isDirty, state.presentation]);

  const loadPresentation = useCallback((pres) => {
    dispatch({ type: 'LOAD', payload: pres });
  }, []);

  const selectedSlide = state.presentation?.slides?.[state.selectedSlideIndex] || null;

  return (
    <EditorContext.Provider value={{
      ...state,
      selectedSlide,
      dispatch,
      loadPresentation,
      canUndo: state.historyIndex > 0,
      canRedo: state.historyIndex < state.history.length - 1,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}
