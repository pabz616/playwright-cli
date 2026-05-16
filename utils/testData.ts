import { faker } from '@faker-js/faker';

const alphaNumericString = faker.string.alphanumeric(8)

export default{
    BASE_URL: "https://www.demoblaze.com/",
    NAME: "Demo Tester: "+faker.string.alphanumeric(3),
    COUNTRY: "USA",
    CITY: faker.location.city(),
    CARD: faker.finance.creditCardNumber(),
    MONTH: faker.date.month({ context: true }),
    YEAR: "2026",
    ORDER_MSG: "Thank you for your purchase!",
    USN: "test",
    PWD: "test",
    CHAOS_USER: `chaos_user_${alphaNumericString}@test.com`,
    CHAOS_PWD:  "ChaosTest123!",
    ALPHA_NUM_STR: alphaNumericString
}