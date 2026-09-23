import { useEffect, type RefObject } from 'react';

const DECIDE_PX = 6; // finger travel before we decide between dragging the sheet and scrolling its content
const FLICK_MIN_PX = 48; // a flick still has to move this far before it counts
const FLICK_PX_PER_MS = 0.5;
const DISMISS_FRACTION = 0.25; // of the panel's height

/**
 * Pull-down-to-dismiss for a bottom sheet. The panel follows the finger 1:1 (scrim fading in step) once a
 * downward drag starts with the content scrolled to the top; released past a quarter of its height, or
 * flicked, it slides the rest of the way and `onClose` fires. Otherwise it springs back on the sheet's own
 * transition. Drags that begin on the map or a time wheel are left to them; upward or scrolled drags just scroll.
 */
export function useSwipeToDismiss(panel: RefObject<HTMLElement | null>, scrim: RefObject<HTMLElement | null>, onClose: () => void, active: boolean) {
  useEffect(() => {
    const el = panel.current;
    if (!el || !active) return;
    let startX = 0, startY = 0, lastY = 0, lastT = 0, velocity = 0, offset = 0;
    let mode: 'undecided' | 'drag' | 'scroll' = 'scroll';

    const restore = () => {
      el.style.transition = ''; el.style.transform = '';
      if (scrim.current) { scrim.current.style.transition = ''; scrim.current.style.opacity = ''; }
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || (e.target as Element).closest('.leaflet-container, .wheel__col')) { mode = 'scroll'; return; }
      startX = e.touches[0].clientX; startY = lastY = e.touches[0].clientY; lastT = e.timeStamp; velocity = 0; offset = 0;
      mode = 'undecided';
    };
    const onMove = (e: TouchEvent) => {
      if (mode === 'scroll') return;
      const { clientX: x, clientY: y } = e.touches[0];
      const dy = y - startY, dx = x - startX;
      if (mode === 'undecided') {
        if (Math.abs(dy) < DECIDE_PX && Math.abs(dx) < DECIDE_PX) return;
        if (dy > 0 && dy > Math.abs(dx) && el.scrollTop <= 0) {
          mode = 'drag';
          el.style.transition = 'none';
          if (scrim.current) scrim.current.style.transition = 'none';
        } else { mode = 'scroll'; return; }
      }
      e.preventDefault(); // keep the browser from rubber-banding the content while the panel moves
      offset = Math.max(0, dy);
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (y - lastY) / dt;
      lastY = y; lastT = e.timeStamp;
      el.style.transform = `translateY(${offset}px)`;
      if (scrim.current) scrim.current.style.opacity = String(Math.max(0, 1 - offset / el.offsetHeight));
    };
    const onEnd = () => {
      if (mode !== 'drag') return;
      mode = 'scroll';
      const dismiss = offset > el.offsetHeight * DISMISS_FRACTION || (offset > FLICK_MIN_PX && velocity > FLICK_PX_PER_MS);
      if (dismiss) {
        // Finish the slide from where the finger left it; the presence hook unmounts the sheet after its exit time.
        el.style.transition = ''; el.style.transform = 'translateY(100%)';
        if (scrim.current) { scrim.current.style.transition = ''; scrim.current.style.opacity = '0'; }
        onClose();
      } else restore();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd); el.removeEventListener('touchcancel', onEnd);
      restore();
    };
  }, [panel, scrim, onClose, active]);
}
