import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { denver, fairCoords, pinDrop, restaurantCoords, restaurants, type RadiusMi, type RestaurantId } from '../fixtures';
import { Pin } from './icons';

type LatLng = { lat: number; lng: number };
type Props = {
  mode: 'empty' | 'around' | 'pin' | 'options';
  radiusMi?: RadiusMi;
  height?: number;
  onSelectPin?: (id: RestaurantId) => void;
};

const MILE_M = 1609.34;
// Fractional zooms chosen so the radius ring is ~80px on a 220px-tall map at Denver's latitude.
const ZOOM: Record<RadiusMi, number> = { 0.5: 13.8, 1: 12.8, 2: 11.8, 5: 10.5 };
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// A real, draggable map (Leaflet + OpenStreetMap tiles, desaturated in CSS). The ring and pins are React elements
// laid over the map and re-projected on every move, so they stay tappable and role-queryable.
export function MapView({ mode, radiusMi = 2, height = 220, onSelectPin }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const [pin, setPin] = useState<LatLng>(pinDrop);
  const [, bump] = useState(0);
  const focus: LatLng = mode === 'pin' ? pin : denver;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, scrollWheelZoom: false, zoomSnap: 0, attributionControl: true, center: denver, zoom: ZOOM[2] });
    m.attributionControl.setPrefix(false);
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(m);
    const rerender = () => bump((n) => n + 1);
    m.on('move zoom', rerender);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  // Pin mode: tapping the map moves the pin. Around-me: nothing to set, the dot is "you".
  useEffect(() => {
    const m = map.current;
    if (!m || mode !== 'pin') return;
    const onTap = (e: L.LeafletMouseEvent) => setPin(e.latlng);
    m.on('click', onTap);
    return () => { m.off('click', onTap); };
  }, [mode]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (mode === 'options') { m.fitBounds(L.latLngBounds(Object.values(restaurantCoords)).pad(0.35), { animate: true }); return; }
    m.flyTo(focus, ZOOM[radiusMi], { duration: 0.45 });
  }, [mode, radiusMi, focus.lat, focus.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const show = mode === 'around' || mode === 'pin';
    if (!show) { circle.current?.remove(); circle.current = null; return; }
    if (!circle.current) circle.current = L.circle(focus, { radius: radiusMi * MILE_M, className: 'map__ring' }).addTo(m);
    circle.current.setLatLng(focus).setRadius(radiusMi * MILE_M);
  }, [mode, radiusMi, focus.lat, focus.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { map.current?.invalidateSize(); }, [height]);

  const project = (p: LatLng) => {
    const m = map.current;
    if (!m) return { left: '50%', top: '50%' };
    const pt = m.latLngToContainerPoint(p);
    return { left: pt.x, top: pt.y };
  };

  return (
    <div className="map" style={{ height }} role={mode === 'options' ? 'group' : 'img'} aria-label="Map of Denver">
      <div ref={el} className="map__canvas" />
      <div className="map__layer">
        {mode === 'around' && <span className="map__me" style={project(denver)} />}
        {mode === 'pin' && <span className="map__pin" style={project(pin)}><Pin size={28} /></span>}
        {mode === 'options' && (
          <>
            <span className="map__fair" style={project(fairCoords)} role="img" aria-label="Middle of the group"><span className="map__fair-dot" /></span>
            {restaurants.map((r) => (
              <button key={r.id} className="map__option t-label" style={project(restaurantCoords[r.id])} onClick={() => onSelectPin?.(r.id)}>
                <span className="map__dot" />{r.name}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
