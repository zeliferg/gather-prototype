import type { ReactNode } from 'react';

type Props = { variant?: 'neutral' | 'selected' | 'success' | 'info' | 'danger'; onClick?: () => void; children: ReactNode; className?: string };

export function Chip({ variant = 'neutral', onClick, children, className }: Props) {
  const cls = `chip chip--${variant} ${className ?? ''}`;
  if (onClick) return <button className={cls} onClick={onClick} aria-pressed={variant === 'selected'}>{children}</button>;
  return <span className={cls}>{children}</span>;
}
