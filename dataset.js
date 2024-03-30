const { faker } = require('@faker-js/faker');

let accounts = [];

const accountId = (i) => {
    const region = faker.helpers.arrayElement( [
        '102',
        '104',
        '150',
        '203',
        '321'
    ]);

    const ag = faker.helpers.arrayElement( [
        '1023',
        '1024',
        '1250',
        '2203',
        '4321'
    ]);

    return `${region}-${ag}-${20000+i}`;
}

for (let i = 0; i < 200000; i++) {
    const newAccount = {
        account_holder: faker.person.fullName(),
        account_id: accountId(1 + i),
        account_type: faker.helpers.arrayElement( [
            'joint_checking',
            'joint_savings',
            'investment',
            'retirement',
            'credit',
            'loan',
            'business',
            'fixed_deposit',
            'international_checking',
            'digital_checking'
        ]),
        balance: faker.finance.amount(),
        created_at: new Date(),
        last_updated: new Date()
    };
    accounts.push(newAccount);
}

module.exports = accounts;