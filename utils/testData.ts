import { faker } from "@faker-js/faker";

export default {
  BASE_URL: "https://www.demoblaze.com/",
  NAV_LINKS: ["Home", "Contact", "About us", "Cart", "Log in", "Sign up"],
  NAME: "Demo Tester: "+ faker.string.alphanumeric(3),
  EMAIL: faker.internet.email(),
  PHONE: faker.phone.number(),
  PRODUCT_CATEGORY1: "Phones",
  PRODUCT_CATEGORY2: "Laptops",
  PRODUCT_CATEGORY3: "Monitors",
  PRODUCT_CATEGORY4: "Tablets",
  COUNTRY: "USA",
  CITY: faker.location.city(),
  CARD: faker.finance.creditCardNumber(),
  MONTH: faker.date.month({ context: true }),
  YEAR: "2026",
  ORDER_MSG: "Thank you for your purchase!",
  USN: "test",
  PWD: "test",
  ALPHA_NUM_STR: faker.string.alphanumeric(10),
  CHAOS_USER: `chaos_user_${faker.string.alphanumeric(8)}@test.com`,
  CHAOS_PWD: "ChaosTest123!",
};
