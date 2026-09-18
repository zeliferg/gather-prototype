import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Back } from './icons';

type Props = {
  back?: boolean | (() => void);
  title?: string;
  subtitle?: string;
  /** Small centred label in the header row (e.g. the "Gather" wordmark on Landing). */
  brand?: string;
  right?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Screen({ back, title, subtitle, brand, right, footer, className, children }: Props) {
  const navigate = useNavigate();
  const onBack = typeof back === 'function' ? back : () => navigate(-1);
  return (
    <div className={`screen ${className ?? ''}`}>
      <div className="screen__header">
        {back ? (
          <button className="icon-btn" aria-label="Back" onClick={onBack}><Back /></button>
        ) : <span />}
        {brand && <span className="screen__brand t-label">{brand}</span>}
        {right ?? <span />}
      </div>
      <div className="screen__body">
        {(title || subtitle) && (
          <div className="screen__title">
            {title && <h1 className="t-title">{title}</h1>}
            {subtitle && <p className="t-secondary c-secondary">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
      {footer && <div className="screen__footer">{footer}</div>}
    </div>
  );
}
