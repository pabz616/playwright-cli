import { faker } from '@faker-js/faker';

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
    PWD: "test"
}