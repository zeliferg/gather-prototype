import { describe, expect, it } from 'vitest';
import { codeError, continueHint, footerHint, phoneError, requiredError } from './form';

describe('field rules', () => {
  it('a required field is fine once it has something other than spaces', () => {
    expect(requiredError('', 'Add your name')).toBe('Add your name');
    expect(requiredError('   ', 'Add your name')).toBe('Add your name');
    expect(requiredError('Jordan', 'Add your name')).toBeNull();
  });

  it('a phone is missing when empty and incomplete until ten digits', () => {
    expect(phoneError('')).toBe('Add your phone number');
    expect(phoneError('(303) 55')).toBe('Enter all 10 digits');
    expect(phoneError('(303) 555-0142')).toBeNull();
  });

  it('a party code needs every character', () => {
    expect(codeError('', 5)).toBe('Enter the 5-character code');
    expect(codeError('7K3', 5)).toBe('Enter the 5-character code');
    expect(codeError('7K3M9', 5)).toBeNull();
  });
});

describe('continueHint', () => {
  it('names the first unmet field, in form order, and nothing once all are met', () => {
    expect(continueHint([{ key: 'name', error: null }, { key: 'phone', error: 'Add your phone number' }, { key: 'where', error: 'Set where you are coming from' }]))
      .toBe('Add your phone number to continue');
    expect(continueHint([{ key: 'name', error: null }, { key: 'phone', error: null }])).toBeNull();
  });
});

describe('footerHint', () => {
  const fields = [{ key: 'name', error: 'Add your name' }, { key: 'phone', error: 'Enter all 10 digits' }];
  it('is the continue hint while no field shows a message of its own', () => {
    expect(footerHint(fields, () => null)).toBe('Add your name to continue');
  });
  it('steps aside while any field is showing its message', () => {
    expect(footerHint(fields, (key, error) => (key === 'phone' ? error : null))).toBeNull();
  });
});
