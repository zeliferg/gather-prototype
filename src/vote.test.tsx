import { describe, it, expect } from 'vitest';
import { tallyVotes, leader, rankByVotes, winner, voteCount } from './vote';
import { guestsComing, votes } from './fixtures';

describe('the group vote', () => {
  it('fixture votes split the others one each, so the tester always decides', () => {
    const others = tallyVotes({ only: guestsComing, exclude: 'priya' });
    expect(others.alma).toHaveLength(1);
    expect(others.heretik).toHaveLength(1);
    expect(others.makfam).toHaveLength(1);
    expect(leader(others)).toBeNull();
    expect(winner(others)).toBe('alma'); // a tie goes to the best spot
  });

  it('the guest vote breaks the tie', () => {
    const t = tallyVotes({ only: guestsComing, exclude: 'priya', mine: { id: 'priya', restaurant: 'heretik' } });
    expect(t.heretik).toEqual(expect.arrayContaining(['marcus', 'priya']));
    expect(leader(t)).toBe('heretik');
    expect(rankByVotes(t)[0].id).toBe('heretik');
    expect(voteCount(t)).toBe(4);
  });

  it('host side: votes arrive in fixture order, only from guests still coming', () => {
    expect(voteCount(tallyVotes({ only: guestsComing, arrived: 0 }))).toBe(0);
    const two = tallyVotes({ only: guestsComing, arrived: 2 });
    expect(two.alma).toEqual(['priya']);
    expect(two.heretik).toEqual(['marcus']);
    const all = tallyVotes({ only: guestsComing });
    expect(voteCount(all)).toBe(votes.length);
    expect(leader(all)).toBe('alma');
    const withoutAlex = tallyVotes({ only: guestsComing.filter((g) => g.id !== 'alex') });
    expect(voteCount(withoutAlex)).toBe(votes.length - 1);
    expect(leader(withoutAlex)).toBeNull();
  });

  it('an empty tally keeps the fairness order', () => {
    expect(rankByVotes(tallyVotes({ only: guestsComing, arrived: 0 })).map((r) => r.id)).toEqual(['alma', 'heretik', 'makfam']);
  });
});
