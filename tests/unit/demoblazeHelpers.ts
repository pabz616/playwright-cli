import locators from '../tests/pageElements/locators';

export type DemoblazeCategory = 'Phones' | 'Laptops' | 'Monitors';

export function getCategorySelector(category: DemoblazeCategory): string {
  switch (category) {
    case 'Phones':
      return locators.PHONES_CATEGORY;
    case 'Laptops':
      return locators.LAPTOPS_CATEGORY;
    case 'Monitors':
      return locators.MONITORS_CATEGORY;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

export function isValidCategory(category: string): category is DemoblazeCategory {
  return category === 'Phones' || category === 'Laptops' || category === 'Monitors';
}

export function buildWelcomeText(username: string): string {
  return `Welcome ${username}`;
}

export function isValidSignUpInput(username: string, password: string): boolean {
  return username.trim().length > 0 && password.length >= 8;
}

export function normalizeContactMessage(message: string): string {
  return message.trim();
}
