import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; inline?: boolean };

export function Button({ variant = 'primary', inline, className, ...rest }: Props) {
  return <button {...rest} className={`btn btn--${variant} ${inline ? 'btn--inline' : ''} ${className ?? ''}`} />;
}
