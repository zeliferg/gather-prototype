import { describe, it, expect } from 'vitest';
import { tallyVotes, leader, rankByVotes, winner, voteCount } from './vote';
import { guestsComing, votes } from './fixtures';

describe('the group vote', () => {
  it('fixture votes split the others one each, so the tester always decides', () => {
    const others = tallyVotes({ only: guestsComing, exclude: 'priya' });
    expect(others.tavola).toHaveLength(1);
    expect(others.corner).toHaveLength(1);
    expect(others.noodle).toHaveLength(1);
    expect(leader(others)).toBeNull();
    expect(winner(others)).toBe('tavola'); // a tie goes to the best spot
  });

  it('the guest vote breaks the tie', () => {
    const t = tallyVotes({ only: guestsComing, exclude: 'priya', mine: { id: 'priya', restaurant: 'corner' } });
    expect(t.corner).toEqual(expect.arrayContaining(['marcus', 'priya']));
    expect(leader(t)).toBe('corner');
    expect(rankByVotes(t)[0].id).toBe('corner');
    expect(voteCount(t)).toBe(4);
  });

  it('host side: votes arrive in fixture order, only from guests still coming', () => {
    expect(voteCount(tallyVotes({ only: guestsComing, arrived: 0 }))).toBe(0);
    const two = tallyVotes({ only: guestsComing, arrived: 2 });
    expect(two.tavola).toEqual(['priya']);
    expect(two.corner).toEqual(['marcus']);
    const all = tallyVotes({ only: guestsComing });
    expect(voteCount(all)).toBe(votes.length);
    expect(leader(all)).toBe('tavola');
    const withoutAlex = tallyVotes({ only: guestsComing.filter((g) => g.id !== 'alex') });
    expect(voteCount(withoutAlex)).toBe(votes.length - 1);
    expect(leader(withoutAlex)).toBeNull();
  });

  it('an empty tally keeps the fairness order', () => {
    expect(rankByVotes(tallyVotes({ only: guestsComing, arrived: 0 })).map((r) => r.id)).toEqual(['tavola', 'corner', 'noodle']);
  });
});
