import { Avatar } from './Avatar';
import { Check } from './icons';

type Props = { initials: string[]; centerCheck?: boolean; /** keep the ring turning and the seats drifting after they land */ live?: boolean };

export function GatheringCircle({ initials, centerCheck, live }: Props) {
  const n = initials.length;
  return (
    <div className={`circle ${centerCheck ? 'circle--done' : ''} ${live ? 'circle--live' : ''}`} aria-hidden>
      <span className="circle__ring" />
      {initials.map((i, k) => {
        const a = (k / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <span key={k} className="circle__seat" style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%`, animationDelay: `calc(${k} * var(--stagger))` }}>
            <span className="circle__float" style={{ animationDelay: `calc(${k} * var(--dur-float) / -${n})` }}><Avatar initial={i} /></span>
          </span>
        );
      })}
      {centerCheck && <span className="circle__check"><Check /></span>}
    </div>
  );
}
