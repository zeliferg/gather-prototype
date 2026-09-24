import { describe, it, expect } from 'vitest';
import { guestList } from './guest';
import { guestsComing, me } from './fixtures';

describe('guestList', () => {
  it('is the fixture list with Priya as "you" when invited by text', () => {
    const { guests, meId } = guestList('', false);
    expect(guests).toBe(guestsComing);
    expect(meId).toBe(me.id);
  });

  it('adds the typed name as a new guest right after the host when joining with a code', () => {
    const { guests, meId } = guestList('Maya Lin', true);
    expect(guests).toHaveLength(guestsComing.length + 1);
    expect(guests[0].status).toBe('host');
    expect(guests[1]).toMatchObject({ id: 'me', name: 'Maya Lin', initial: 'M', status: 'responded' });
    expect(guests[2].id).toBe('priya');
    expect(meId).toBe('me');
  });

  it('falls back to Priya until a name is typed', () => {
    expect(guestList('  ', true).meId).toBe(me.id);
  });
});
