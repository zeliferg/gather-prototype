// Figma: ORG 4d — Edit cover (sheet). Choices preview on the cover behind at once; Cancel or the scrim puts the
// original back, Save keeps it. Open it with the cover it was opened on, so there is something to cancel back to.
import { Sheet } from './Sheet';
import { Button } from './Button';
import { Chevron } from './icons';
import { coverColours } from '../fixtures';
import { usePrototypeState, type CoverChoice } from '../state';

type Props = { /** the cover at the moment the sheet opened; null = closed */ original: CoverChoice | null; onClose: () => void };

export function CoverSheet({ original, onClose }: Props) {
  const [state, update] = usePrototypeState();
  const open = original !== null;
  const choose = (cover: CoverChoice) => update({ cover });
  const cancel = () => { if (original) update({ cover: original }); onClose(); };
  return (
    <Sheet open={open} onClose={cancel} title="Edit cover" subtitle="Guests see it at the top of the party page.">
      <div className="list">
        <button className={`row menu-row t-body ${state.cover === 'photo' ? 'c-accent' : ''}`} onClick={() => choose('photo')}>Choose from photos<Chevron size={20} /></button>
        <button className="row menu-row t-body" onClick={() => choose('photo')}>Take a photo<Chevron size={20} /></button>
      </div>
      <p className="t-caption c-secondary">Or pick a colour</p>
      <div className="swatches">
        {coverColours.map((c) => (
          <button key={c.id} className={`swatch ${state.cover === c.id ? 'swatch--on' : ''}`} style={{ background: c.token }} aria-label={c.label} aria-pressed={state.cover === c.id}
            onClick={() => choose(c.id)} />
        ))}
      </div>
      <button className="t-body" style={{ color: state.cover === 'none' ? 'var(--text-primary)' : 'var(--error)', textAlign: 'left' }} aria-pressed={state.cover === 'none'} onClick={() => choose('none')}>{state.cover === 'none' ? 'Cover removed' : 'Remove cover'}</button>
      <Button onClick={onClose} disabled={state.cover === original}>Save</Button>
      <Button variant="ghost" onClick={cancel}>Cancel</Button>
    </Sheet>
  );
}
