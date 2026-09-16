import { useState } from 'react';
import { usePrototypeState } from '../state';
import { radiusOptions } from '../fixtures';
import { Segmented } from './Segmented';
import { MapView } from './MapView';
import { Chip } from './Chip';
import { Input } from './Input';
import { PermissionDialog } from './PermissionDialog';

type Props = { context: 'host' | 'guest' };

export function LocationPicker({ context }: Props) {
  const [state, update] = usePrototypeState();
  const [address, setAddress] = useState(state.permission === 'granted' ? 'Current location' : '');
  const askPermission = state.permission === 'unknown';
  const mode = state.locationMode;
  const mapMode = state.permission === 'granted' || mode === 'pin' ? mode : 'empty';

  return (
    <>
      <PermissionDialog
        open={askPermission}
        body={context === 'host' ? "Only used to find a spot that's fair for everyone. Guests never see it." : "Only used to find a spot that's fair for everyone. Nobody sees your exact location."}
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
