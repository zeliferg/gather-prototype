import { describe, it, expect } from 'vitest';
import { monthGrid, parseWhen, toWhen, whenLabel } from './when';

describe('parseWhen / toWhen', () => {
  it('round-trips a datetime-local value', () => {
    expect(parseWhen('2025-09-12T19:05')).toEqual({ year: 2025, month: 8, day: 12, hour: 19, minute: 5 });
    expect(toWhen({ year: 2025, month: 8, day: 12, hour: 19, minute: 5 })).toBe('2025-09-12T19:05');
    expect(parseWhen('')).toBeNull();
  });
  it('carries a day that does not exist in the new month', () => {
    // 31 Aug → September has 30 days
    expect(toWhen({ year: 2025, month: 8, day: 31, hour: 9, minute: 0 })).toBe('2025-09-30T09:00');
  });
});

describe('monthGrid', () => {
  it('lays September 2025 out Sunday-first with leading and trailing blanks', () => {
    const grid = monthGrid(2025, 8);
    expect(grid[0]).toEqual([null, 1, 2, 3, 4, 5, 6]); // 1 Sep 2025 is a Monday
    expect(grid[grid.length - 1]).toEqual([28, 29, 30, null, null, null, null]);
    expect(grid.every((w) => w.length === 7)).toBe(true);
  });
});

describe('whenLabel', () => {
  it('reads like a calendar event', () => {
    expect(whenLabel('2025-09-12T19:00')).toBe('Fri, Sep 12 · 7:00 PM');
    expect(whenLabel('2025-09-12T00:05')).toBe('Fri, Sep 12 · 12:05 AM');
    expect(whenLabel('')).toBe('');
  });
});
