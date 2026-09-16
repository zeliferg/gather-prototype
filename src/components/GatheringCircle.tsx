import { Avatar } from './Avatar';
import { Check } from './icons';

export function GatheringCircle({ initials, centerCheck }: { initials: string[]; centerCheck?: boolean }) {
  const n = initials.length;
  return (
    <div className={`circle ${centerCheck ? 'circle--done' : ''}`} aria-hidden>
      <span className="circle__ring" />
      {initials.map((i, k) => {
        const a = (k / n) * Math.PI * 2 - Math.PI / 2;
        return <span key={k} className="circle__seat" style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%`, animationDelay: `${k * 60}ms` }}><Avatar initial={i} /></span>;
      })}
      {centerCheck && <span className="circle__check"><Check /></span>}
    </div>
  );
}
