// Figma: P 3 — Party page (before joining)
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { party } from '../../fixtures';

export function PLobby() {
  const navigate = useNavigate();
  return (
    <Screen footer={<>
      <Button onClick={() => navigate('/p/verify')}>Verify and join</Button>
      <p className="t-caption c-secondary" style={{ textAlign: 'center' }}>We'll text a code to your number first.</p>
    </>}>
      <div className="cover"><img src="/photos/cover.jpg" alt="" /></div>
      <div className="screen__title" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1 className="t-title">{party.name}</h1>
        <p className="t-secondary c-secondary">{party.roughTime}</p>
      </div>
      <div className="hstack" style={{ justifyContent: 'center' }}><Avatar initial="J" size={32} /><span className="t-secondary">Hosted by {party.hostFirst}</span></div>
      <div className="divider" />
      <div className="avatar-stack" style={{ justifyContent: 'center' }}><Avatar initial="A" /><Avatar initial="C" /><span className="avatar avatar--more t-label" style={{ width: 40, height: 40 }}>+3</span></div>
      <p className="t-secondary c-secondary" style={{ textAlign: 'center' }}>A., C., and 3 others are in. Names show once you join.</p>
    </Screen>
  );
}
