import { useEffect, type RefObject } from 'react';

const DECIDE_PX = 6;
const DISMISS_PX = 40; // an upward drag this far, or a flick, sends the banner away
const FLICK_PX_PER_MS = 0.4;

/**
 * Swipe-up-to-dismiss for a notification banner, the way iOS banners go. The card follows the finger while
 * it moves up (never down); released past DISMISS_PX or flicked, it slides the rest of the way on its own
 * transition and `onClose` fires. Otherwise it springs back. Sideways or downward drags are left alone.
 */
export function useSwipeUpToDismiss(card: RefObject<HTMLElement | null>, onClose: () => void, active: boolean) {
  useEffect(() => {
    const el = card.current;
    if (!el || !active) return;
    let startX = 0, startY = 0, lastY = 0, lastT = 0, velocity = 0, offset = 0;
    let mode: 'idle' | 'undecided' | 'drag' = 'idle';
    const restore = () => { el.style.transition = ''; el.style.transform = ''; };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { mode = 'idle'; return; }
      startX = e.touches[0].clientX; startY = lastY = e.touches[0].clientY; lastT = e.timeStamp; velocity = 0; offset = 0;
      mode = 'undecided';
    };
    const onMove = (e: TouchEvent) => {
      if (mode === 'idle') return;
      const { clientX: x, clientY: y } = e.touches[0];
      const dy = y - startY, dx = x - startX;
      if (mode === 'undecided') {
        if (Math.abs(dy) < DECIDE_PX && Math.abs(dx) < DECIDE_PX) return;
        if (dy < 0 && -dy > Math.abs(dx)) { mode = 'drag'; el.style.transition = 'none'; } else { mode = 'idle'; return; }
      }
      e.preventDefault();
      offset = Math.min(0, dy);
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (y - lastY) / dt;
      lastY = y; lastT = e.timeStamp;
      el.style.transform = `translateY(${offset}px)`;
    };
    const onEnd = () => {
      if (mode !== 'drag') { mode = 'idle'; return; }
      mode = 'idle';
      if (-offset > DISMISS_PX || (-offset > DECIDE_PX && velocity < -FLICK_PX_PER_MS)) {
        // Finish the slide from where the finger left it; the presence hook unmounts the banner after its exit time.
        el.style.transition = ''; el.style.transform = 'translateY(calc(-100% - 24px))';
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
  }, [card, onClose, active]);
}
