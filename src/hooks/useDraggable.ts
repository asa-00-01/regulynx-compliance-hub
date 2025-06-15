
import { useState, useEffect, useRef, useCallback } from 'react';

export const useDraggable = (ref: React.RefObject<HTMLElement>) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const hasInitialized = useRef(false);

  // This ref stores all information about the drag state
  const dragInfo = useRef({
    isDragging: false,
    hasDragged: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Effect to set the initial position of the element
  useEffect(() => {
    if (ref.current && !hasInitialized.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
      hasInitialized.current = true;
    }
  }, [ref]);

  // Mouse move handler
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragInfo.current.isDragging && ref.current) {
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;

      // Start dragging only after mouse has moved a certain threshold
      if (!dragInfo.current.hasDragged && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        dragInfo.current.hasDragged = true;
        document.body.style.cursor = 'grabbing';
      }

      if (dragInfo.current.hasDragged) {
        const newX = e.clientX - dragInfo.current.offsetX;
        const newY = e.clientY - dragInfo.current.offsetY;
        
        const newPosX = Math.max(0, Math.min(newX, window.innerWidth - ref.current.offsetWidth));
        const newPosY = Math.max(0, Math.min(newY, window.innerHeight - ref.current.offsetHeight));
        setPosition({ x: newPosX, y: newPosY });
      }
    }
  }, [ref]);

  // Mouse up handler
  const onMouseUp = useCallback((e: MouseEvent) => {
    if (dragInfo.current.hasDragged) {
      // Prevent click event from firing after a drag
      e.preventDefault();
      e.stopPropagation();
    }
    
    dragInfo.current.isDragging = false;
    dragInfo.current.hasDragged = false;
    document.body.style.cursor = 'default';

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp, true);
  }, [onMouseMove]);

  // Mouse down handler
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (ref.current && e.button === 0) {
      const rect = ref.current.getBoundingClientRect();
      
      dragInfo.current = {
        isDragging: true,
        hasDragged: false,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp, true);
    }
  }, [onMouseMove, onMouseUp]);

  const style: React.CSSProperties = hasInitialized.current ? {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    margin: 0,
  } : {
    opacity: 0,
  };

  return { style, onMouseDown };
};
