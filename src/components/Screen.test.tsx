import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Screen } from './Screen';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Screen header', () => {
  it('renders no header row when there is nothing to put in it, so scrolled content clips at the very top', () => {
    const { container } = wrap(<Screen footer={<button>Go</button>}>body</Screen>);
    expect(container.querySelector('.screen__header')).toBeNull();
    expect(container.querySelector('.screen')?.classList.contains('screen--bare')).toBe(true);
  });

  it('keeps the header row when there is a back button, a brand or a right action', () => {
    expect(wrap(<Screen back>body</Screen>).container.querySelector('.screen__header')).not.toBeNull();
    expect(wrap(<Screen brand="Gather">body</Screen>).container.querySelector('.screen__header')).not.toBeNull();
    expect(wrap(<Screen right={<button>Skip</button>}>body</Screen>).container.querySelector('.screen__header')).not.toBeNull();
  });
});
