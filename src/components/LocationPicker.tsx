import { usePrototypeState } from '../state';
import { permissionBody, radiusOptions } from '../fixtures';
import { Segmented } from './Segmented';
import { MapView } from './MapView';
import { Chip } from './Chip';
import { PermissionDialog } from './PermissionDialog';

type Props = {
  context: 'host' | 'guest';
  /** Ask for location permission on mount when it is still unknown. The host's Create Party
   *  screen asks before opening its drawer instead, so it passes false. */
  askPermission?: boolean;
};

export function LocationPicker({ context, askPermission = true }: Props) {
  const [state, update] = usePrototypeState();
  const mode = state.locationMode;
  const mapMode = state.permission === 'granted' || mode === 'pin' ? mode : 'empty';

  return (
    <>
      <PermissionDialog
        open={askPermission && state.permission === 'unknown'}
        body={permissionBody[context]}
        onAllow={() => update({ permission: 'granted', locationMode: 'around' })}
        onDeny={() => { update({ permission: 'denied', locationMode: 'pin' }); }}
      />
      {/* One compact picker for both sides (6 Oct 2026): the host's address search field is gone */}
      <Segmented
        options={[{ value: 'around', label: 'Around me' }, { value: 'pin', label: 'Drop a pin' }]}
        value={mode}
        onChange={(v) => update({ locationMode: v })}
      />
      <MapView mode={mapMode} radiusMi={state.radiusMi} />
      {state.permission === 'denied' && mode === 'around' && <p className="t-caption c-secondary">Location access is off. Use Drop a pin instead.</p>}
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
