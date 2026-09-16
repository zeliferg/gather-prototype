import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PrototypeStateProvider, usePrototypeState, defaultState, STORAGE_KEY } from './state';

const wrapper = ({ children }: { children: React.ReactNode }) => <PrototypeStateProvider>{children}</PrototypeStateProvider>;

describe('usePrototypeState', () => {
  beforeEach(() => sessionStorage.clear());

  it('starts from defaultState', () => {
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    expect(result.current[0]).toEqual(defaultState);
  });

  it('merges a patch and persists it to sessionStorage', () => {
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    act(() => result.current[1]({ radiusMi: 5, locationMode: 'pin' }));
    expect(result.current[0].radiusMi).toBe(5);
    expect(result.current[0].locationMode).toBe('pin');
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).radiusMi).toBe(5);
  });

  it('rehydrates from sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaultState, droppedOut: true }));
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    expect(result.current[0].droppedOut).toBe(true);
  });

  it('reset returns to defaultState and clears storage', () => {
    const { result } = renderHook(() => usePrototypeState(), { wrapper });
    act(() => result.current[1]({ joined: true }));
    act(() => result.current[2]());
    expect(result.current[0]).toEqual(defaultState);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
