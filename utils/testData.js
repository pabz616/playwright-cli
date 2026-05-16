import { faker } from "@faker-js/faker";

const alphaNumericString = faker.string.alphanumeric();

export default {
  BASE_URL: "https://www.demoblaze.com/",
  NAME: "Demo Tester: " + alphaNumericString(10),
  EMAIL: faker.internet.email(),
  PHONE: faker.phone.number(),
  CATEGORY1: "Phones",
  CATEGORY2: "Laptops",
  CATEGORY3: "Monitors",
  CATEGORY4: "Tablets",
  COUNTRY: "USA",
  CITY: faker.location.city(),
  CARD: faker.finance.creditCardNumber(),
  MONTH: faker.date.month({ context: true }),
  YEAR: "2026",
  ORDER_MSG: "Thank you for your purchase!",
  USN: "test",
  PWD: "test",
  ALPHA_NUM_STR: alphaNumericString(10),
  CHAOS_USER: `chaos_user_${alphaNumericString(8)}@test.com`,
  CHAOS_PWD: "ChaosTest123!",
};
