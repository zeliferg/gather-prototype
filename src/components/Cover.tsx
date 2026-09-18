import type { ReactNode } from 'react';
import { coverColours } from '../fixtures';
import type { CoverChoice } from '../state';

export function Cover({ choice, children }: { choice: CoverChoice; children?: ReactNode }) {
  const colour = coverColours.find((c) => c.id === choice);
  return (
    <div className={`cover ${choice === 'none' ? 'cover--none' : ''}`} style={colour ? { background: colour.token } : undefined}>
      {choice === 'photo' && <img src="/photos/cover.jpg" alt="" />}
      {children}
    </div>
  );
}
