import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Back } from './icons';

type Props = {
  back?: boolean | (() => void);
  title?: string;
  subtitle?: string;
  /** Centred wordmark in the header row (Landing). */
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
        {brand && <span className="screen__brand">{brand}</span>}
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
