import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Screen } from './components/Screen';
import { Button } from './components/Button';
import { Chip } from './components/Chip';
import { Input } from './components/Input';
import { Avatar } from './components/Avatar';
import { Segmented } from './components/Segmented';
import { CodeInput } from './components/CodeInput';

export default function App() {
  const [seg, setSeg] = useState<'around' | 'pin'>('around');
  const [code, setCode] = useState('42');
  return (
    <BrowserRouter>
      <div className="phone">
        <Screen title="Kitchen sink" subtitle="Every primitive, once." footer={<><Button>Primary</Button><Button variant="ghost">Ghost</Button></>}>
          <Input label="Your name" value="Jordan Reyes" />
          <div className="chip-row"><Chip>Neutral</Chip><Chip variant="selected">Selected</Chip><Chip variant="success">Success</Chip><Chip variant="info">Info</Chip></div>
          <div className="avatar-stack"><Avatar initial="J" /><Avatar initial="P" /><Avatar initial="M" /></div>
          <Segmented options={[{ value: 'around', label: 'Around me' }, { value: 'pin', label: 'Drop a pin' }]} value={seg} onChange={setSeg} />
          <CodeInput value={code} onChange={setCode} />
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
        </Screen>
      </div>
    </BrowserRouter>
  );
}
