import { describe, it, expect } from 'vitest';
import { snapMinutes } from './time';

describe('snapMinutes', () => {
  it('rounds a datetime-local value to the nearest quarter hour', () => {
    expect(snapMinutes('2025-09-12T14:47', 15)).toBe('2025-09-12T14:45');
    expect(snapMinutes('2025-09-12T14:53', 15)).toBe('2025-09-12T15:00');
    expect(snapMinutes('2025-09-12T14:07', 15)).toBe('2025-09-12T14:00');
    expect(snapMinutes('2025-09-12T14:08', 15)).toBe('2025-09-12T14:15');
  });
  it('carries past midnight and leaves already-snapped or empty values alone', () => {
    expect(snapMinutes('2025-09-12T23:55', 15)).toBe('2025-09-13T00:00');
    expect(snapMinutes('2025-09-12T19:00', 15)).toBe('2025-09-12T19:00');
    expect(snapMinutes('', 15)).toBe('');
    expect(snapMinutes('garbage', 15)).toBe('garbage');
  });
});
