import { buildWelcomeText, getCategorySelector, isValidCategory, isValidSignUpInput, normalizeContactMessage } from './demoblazeHelpers';

describe('Demoblaze helper utilities', () => {
  test('returns selectors for valid categories', () => {
    expect(getCategorySelector('Phones')).toContain('Phones');
    expect(getCategorySelector('Laptops')).toContain('Laptops');
    expect(getCategorySelector('Monitors')).toContain('Monitors');
  });

  test('rejects unknown categories', () => {
    expect(() => getCategorySelector('Tablets' as any)).toThrow('Unknown category');
    expect(isValidCategory('Phones')).toBe(true);
    expect(isValidCategory('Tablets')).toBe(false);
  });

  test('builds the expected welcome text', () => {
    expect(buildWelcomeText('tester')).toBe('Welcome tester');
  });

  test('validates sign-up inputs', () => {
    expect(isValidSignUpInput('demo', 'Password123')).toBe(true);
    expect(isValidSignUpInput('', 'Password123')).toBe(false);
    expect(isValidSignUpInput('demo', 'short')).toBe(false);
  });

  test('normalizes contact messages by trimming whitespace', () => {
    expect(normalizeContactMessage('  hello from demoblaze  ')).toBe('hello from demoblaze');
  });
});