import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PrototypeStateProvider } from './state';
import { Screen } from './components/Screen';
import { Button } from './components/Button';
import { Sheet } from './components/Sheet';
import { ActionSheet } from './components/ActionSheet';
import { LocationPicker } from './components/LocationPicker';

function Demo() {
  const [sheet, setSheet] = useState(false);
  const [action, setAction] = useState(false);
  return (
    <Screen title="Overlays" footer={<><Button onClick={() => setSheet(true)}>Open sheet</Button><Button variant="secondary" onClick={() => setAction(true)}>Open action sheet</Button></>}>
      <LocationPicker context="host" />
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Your location" subtitle="Only used to find a fair spot.">
        <Button onClick={() => setSheet(false)}>Use this location</Button>
      </Sheet>
      <ActionSheet open={action} title="Open Tavola Verde in" options={[{ label: 'Apple Maps' }, { label: 'Google Maps' }]} onClose={() => setAction(false)} />
    </Screen>
  );
}

export default function App() {
  return (
    <PrototypeStateProvider>
      <BrowserRouter>
        <div className="phone">
          <Demo />
        </div>
      </BrowserRouter>
    </PrototypeStateProvider>
  );
}
