import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function DevHint({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="devhint t-caption" to={to}>Prototype: {children} →</Link>;
}
