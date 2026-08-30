import React, { useCallback } from 'react';
import { Plus, Copy, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useEditor } from '../../context/EditorContext.jsx';
import { presentationService } from '../../services/presentationService.js';
import { useToast } from '../../context/ToastContext.jsx';

function MiniSlide({ slide, index, isSelected }) {
  const colors = { bg: '#eef2ff', accent: '#4338ca', text: '#3730a3' };
  return (
    <div className={`slide-thumb ${isSelected ? 'selected' : ''}`}>
      <div className="absolute inset-0 p-2" style={{ background: colors.bg }}>
        {slide.title && (
          <p className="text-[5px] font-bold truncate" style={{ color: colors.text }}>{slide.title}</p>
        )}
        <div className="mt-1.5 space-y-1">
          {[1,2,3].map((i) => (
            <div key={i} className="h-[2px] rounded-full opacity-20"
              style={{ width: `${65 - i*10}%`, background: colors.accent }} />
          ))}
        </div>
        {/* chart hint */}
        {slide.layout === 'chart' && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5">
            {[2,4,3,5].map((h, i) => (
              <div key={i} className="w-1 rounded-sm opacity-30"
                style={{ height: `${h * 2}px`, background: colors.accent }} />
            ))}
          </div>
        )}
      </div>
      {/* slide number */}
      <div className="absolute top-1 left-1 text-[6px] font-semibold text-gray-400">{index + 1}</div>
    </div>
  );
}

export default function SlidePanel() {
  const { presentation, selectedSlideIndex, dispatch } = useEditor();
  const { showError } = useToast();
  const slides = presentation?.slides || [];

  const onDragEnd = useCallback(({ destination, source }) => {
    if (!destination || destination.index === source.index) return;
    const reordered = Array.from(slides);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    dispatch({ type: 'REORDER_SLIDES', payload: reordered });
  }, [slides, dispatch]);

  const handleDuplicate = (e, index) => {
    e.stopPropagation();
    const slide = { ...slides[index], _id: undefined };
    dispatch({ type: 'ADD_SLIDE', payload: { ...slide, title: slide.title + ' (copy)' } });
  };

  const handleDelete = (e, index) => {
    e.stopPropagation();
    if (slides.length <= 1) return showError('A presentation must have at least one slide');
    dispatch({ type: 'DELETE_SLIDE', index });
  };

  return (
    <div className="w-[180px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Scrollable thumbnails */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {slides.map((slide, i) => (
                  <Draggable key={slide._id || i} draggableId={String(slide._id || i)} index={i}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`group relative ${snapshot.isDragging ? 'opacity-70' : ''}`}
                        onClick={() => dispatch({ type: 'SELECT_SLIDE', index: i })}
                        id={`slide-thumb-${i}`}
                      >
                        {/* Drag handle */}
                        <div
                          {...prov.dragHandleProps}
                          className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab"
                        >
                          <GripVertical className="w-3 h-3 text-gray-300" />
                        </div>

                        <MiniSlide slide={slide} index={i} isSelected={i === selectedSlideIndex} />

                        {/* Hover actions */}
                        <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                          <button
                            onClick={(e) => handleDuplicate(e, i)}
                            className="w-5 h-5 bg-white rounded shadow-sm flex items-center justify-center hover:bg-gray-100"
                            title="Duplicate"
                          >
                            <Copy className="w-2.5 h-2.5 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, i)}
                            className="w-5 h-5 bg-white rounded shadow-sm flex items-center justify-center hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Add slide footer */}
      <div className="border-t border-gray-100 p-2">
        <button
          id="slide-panel-add-btn"
          onClick={() => dispatch({ type: 'ADD_SLIDE', payload: { title: 'New Slide', content: '', layout: 'content' } })}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slide
        </button>
      </div>
    </div>
  );
}
