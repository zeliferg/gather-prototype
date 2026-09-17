import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = { time: string; text: string; link: string; to: string; children?: ReactNode };

export function SmsScreen({ time, text, link, to, children }: Props) {
  return (
    <div className="sms">
      <div className="sms__contact">
        <span className="sms__avatar t-heading">G</span>
        <span className="t-caption c-secondary">Gather</span>
      </div>
      <div className="divider" />
      <p className="t-caption c-secondary sms__time">{time}</p>
      <div className="sms__bubble t-body">
        <p>{text}</p>
        <Link className="sms__link" to={to}>{link}</Link>
      </div>
      {children}
    </div>
  );
}
