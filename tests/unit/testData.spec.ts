import testData from '../../utils/testData';

describe('Demoblaze test data config', () => {
  test('exports the expected base URL and credentials', () => {
    expect(testData.BASE_URL).toBe('https://www.demoblaze.com/');
    expect(testData.USN).toBe('test');
    expect(testData.PWD).toBe('test');
  });

  test('generates a demo user name in the expected format', () => {
    expect(testData.NAME).toMatch(/^Demo Tester: [A-Za-z0-9]{3}$/);
  });

  test('contains purchase metadata', () => {
    expect(testData.ORDER_MSG).toBe('Thank you for your purchase!');
    expect(testData.YEAR).toBe('2026');
    expect(testData.MONTH.length).toBeGreaterThan(0);
    expect(testData.CARD).toMatch(/^[0-9-]+$/);
  });
});