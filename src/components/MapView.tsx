import { fairPoint, restaurants, type RadiusMi, type RestaurantId } from '../fixtures';
import { Pin } from './icons';

type Props = {
  mode: 'empty' | 'around' | 'pin' | 'options';
  radiusMi?: RadiusMi;
  height?: number;
  onSelectPin?: (id: RestaurantId) => void;
};

const RING_PX: Record<RadiusMi, number> = { 0.5: 70, 1: 110, 2: 150, 5: 210 };

export function MapView({ mode, radiusMi = 2, height = 220, onSelectPin }: Props) {
  const ring = RING_PX[radiusMi];
  const center = mode === 'pin' ? { left: '66%', top: '50%' } : { left: '50%', top: '50%' };
  return (
    <div className="map" style={{ height }} aria-label="Map of Denver" role="img">
      {(mode === 'around' || mode === 'pin') && (
        <span className={`map__ring ${mode === 'pin' ? 'map__ring--pin' : ''}`} style={{ width: ring, height: ring, ...center }} />
      )}
      {mode === 'around' && <span className="map__me" style={center} />}
      {mode === 'pin' && <span className="map__pin" style={center}><Pin size={28} /></span>}
      {mode === 'options' && (
        <>
          <span className="map__fair t-label" style={{ left: `${fairPoint.x * 100}%`, top: `${fairPoint.y * 100}%` }}>Fair meeting point</span>
          {restaurants.map((r) => (
            <button key={r.id} className="map__option t-label" style={{ left: `${r.pin.x * 100}%`, top: `${r.pin.y * 100}%` }} onClick={() => onSelectPin?.(r.id)}>
              <span className="map__dot" />{r.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
