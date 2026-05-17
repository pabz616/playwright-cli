export type ProductCategory = 'Phones' | 'Laptops' | 'Monitors';
import testData from "../../utils/testData";
export function getCategorySelector(category: ProductCategory): string {
  switch (category) {
    case 'Phones':
      return testData.PRODUCT_CATEGORY1;
    case 'Laptops':
      return testData.PRODUCT_CATEGORY2;
    case 'Monitors':
      return testData.PRODUCT_CATEGORY3;
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

export function isValidCategory(category: string): category is ProductCategory {
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
