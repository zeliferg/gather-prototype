import { describe, it, expect } from 'vitest';
import { deriveGuests } from './party';
import { guests } from './fixtures';

describe('deriveGuests', () => {
  it('splits fixture guests into coming and out, keeping the host first', () => {
    const { all, coming, out } = deriveGuests([], []);
    expect(all).toHaveLength(guests.length);
    expect(coming[0].status).toBe('host');
    expect(coming.every((g) => g.status !== 'out')).toBe(true);
    expect(out.map((g) => g.id)).toEqual(['leo']);
  });

  it('drops removed guests everywhere', () => {
    const { all, coming, out } = deriveGuests(['leo', 'alex'], []);
    expect(all.find((g) => g.id === 'alex')).toBeUndefined();
    expect(coming.find((g) => g.id === 'alex')).toBeUndefined();
    expect(out).toEqual([]);
  });

  it('appends manually added guests as waiting, without a photo', () => {
    const { coming } = deriveGuests([], [{ id: 'added-1', name: 'Lena Park', initial: 'L' }]);
    const lena = coming[coming.length - 1];
    expect(lena).toMatchObject({ name: 'Lena Park', status: 'waiting' });
    expect(lena.avatar).toBeUndefined();
  });
});
