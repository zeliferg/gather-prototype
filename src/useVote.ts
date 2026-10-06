// The vote as each side sees it. Host: fixture votes arrive one per tick once everyone's in (VoteWatcher
// advances `hostVotesIn`). Guest: the fixture votes of everyone else, plus the one the tester casts.
import { votes, type Guest, type RestaurantId } from './fixtures';
import { usePrototypeState } from './state';
import { useParty } from './party';
import { useGuestList } from './guest';
import { tallyVotes, voteCount, leader, rankByVotes, winner } from './vote';

export function useHostVote() {
  const [state] = usePrototypeState();
  const { coming } = useParty();
  // The host doesn't vote: they pick from what the group said (6 Oct 2026). Only the guests' votes count.
  const tally = tallyVotes({ only: coming, arrived: state.hostVotesIn });
  const expected = votes.filter((v) => coming.some((g) => g.id === v.guestId)).length;
  const arrived = voteCount(tally);
  return {
    /** the host chose "Everyone votes" */
    on: state.decide === 'vote',
    tally, arrived, expected,
    /** the guests coming (not the host); manually added guests never vote, so this can stay above `expected` */
    voters: coming.length - 1,
    /** the guests' votes are all in (the host's own is optional) */
    allIn: Math.min(state.hostVotesIn, expected) >= expected,
    leader: leader(tally),
    ranked: rankByVotes(tally),
    votersOf: (id: RestaurantId): Guest[] => coming.filter((g) => tally[id].includes(g.id)),
  };
}

export function useGuestVote() {
  const [state] = usePrototypeState();
  const { guests, meId } = useGuestList();
  const tally = tallyVotes({ only: guests, exclude: meId, mine: state.vote ? { id: meId, restaurant: state.vote } : null });
  return {
    open: state.voteOpenAt !== null,
    tally,
    arrived: voteCount(tally),
    voters: guests.length - 1,
    leader: leader(tally),
    winner: winner(tally),
    ranked: rankByVotes(tally),
    votersOf: (id: RestaurantId): Guest[] => guests.filter((g) => tally[id].includes(g.id)),
  };
}
