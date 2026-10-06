// v2: once everyone's in and the host chose "Everyone votes", the guests' votes arrive one per
// VOTE_TICK_MS on whatever host screen is open. When the last one lands, a Gather banner says so;
// it stays until closed and tapping it opens the vote (ORG 6).
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../components/Notification';
import { restaurants, VOTE_TICK_MS } from '../../fixtures';
import { usePrototypeState } from '../../state';
import { useHostVote } from '../../useVote';

export function VoteWatcher() {
  const navigate = useNavigate();
  const [state, update] = usePrototypeState();
  const { on, allIn, arrived, voters, expected, leader } = useHostVote();
  const live = on && state.everyoneIn && !state.booked;

  useEffect(() => {
    if (!live || allIn) return;
    const t = setTimeout(() => update({ hostVotesIn: state.hostVotesIn + 1 }), VOTE_TICK_MS);
    return () => clearTimeout(t);
  }, [live, allIn, state.hostVotesIn, update]);

  const lead = restaurants.find((r) => r.id === leader);
  const text = `Votes are in! ${arrived} of ${voters} picked a favourite${lead ? `, and ${lead.name} leads` : ', and it’s a tie'}. You have the last say.`;
  return (
    <>
      {/* The moment the vote opens: everyone's in and the group is picking; the host watches, then picks */}
      <Notification open={live && !allIn && !state.voteOpenTold} onClose={() => update({ voteOpenTold: true })} app="Gather" closeButton closeLabel="Dismiss vote open"
        onTap={() => navigate('/org/options')} text="Everyone's in! The group is picking a favourite now. See the places and how it's going." />
      <Notification open={live && allIn && expected > 0 && !state.votesInSeen} onClose={() => update({ votesInSeen: true })} app="Gather" autoHideMs={0} closeButton closeLabel="Dismiss votes"
        onTap={() => navigate('/org/options')} text={text} />
    </>
  );
}
