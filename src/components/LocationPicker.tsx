import { useState } from 'react';
import { usePrototypeState } from '../state';
import { permissionBody, radiusOptions } from '../fixtures';
import { Segmented } from './Segmented';
import { MapView } from './MapView';
import { Chip } from './Chip';
import { Input } from './Input';
import { PermissionDialog } from './PermissionDialog';

type Props = {
  context: 'host' | 'guest';
  /** Ask for location permission on mount when it is still unknown. The host's Create Party
   *  screen asks before opening its drawer instead, so it passes false. */
  askPermission?: boolean;
};

export function LocationPicker({ context, askPermission = true }: Props) {
  const [state, update] = usePrototypeState();
  const [address, setAddress] = useState(state.permission === 'granted' ? 'Current location' : '');
  const mode = state.locationMode;
  const mapMode = state.permission === 'granted' || mode === 'pin' ? mode : 'empty';

  return (
    <>
      <PermissionDialog
        open={askPermission && state.permission === 'unknown'}
        body={permissionBody[context]}
        onAllow={() => { update({ permission: 'granted', locationMode: 'around' }); setAddress('Current location'); }}
        onDeny={() => { update({ permission: 'denied', locationMode: 'pin' }); }}
      />
      {context === 'host' && (
        <Input label="Search an address or neighborhood" value={address} onChange={setAddress} placeholder="Search an address or neighborhood" />
      )}
      <Segmented
        options={[{ value: 'around', label: 'Around me' }, { value: 'pin', label: 'Drop a pin' }]}
        value={mode}
        onChange={(v) => { update({ locationMode: v }); if (v === 'pin' && context === 'host') setAddress('RiNo, Denver'); if (v === 'around' && state.permission === 'granted') setAddress('Current location'); }}
      />
      <MapView mode={mapMode} radiusMi={state.radiusMi} />
      {state.permission === 'denied' && mode === 'around' && <p className="t-caption c-secondary">Location access is off. Use Drop a pin, or search an address.</p>}
      <p className="t-caption c-secondary">{mode === 'pin' ? 'Drag the map, tap to move the pin.' : 'Drag the map to look around.'}</p>
      <div className="card">
        <p className="t-body-med">{mode === 'pin' ? 'How far from the pin?' : 'How far would you go?'}</p>
        <div className="chip-row">
          {radiusOptions.map((o) => (
            <Chip key={o.value} variant={o.value === state.radiusMi ? 'selected' : 'neutral'} onClick={() => update({ radiusMi: o.value })}>{o.label}</Chip>
          ))}
        </div>
      </div>
    </>
  );
}
