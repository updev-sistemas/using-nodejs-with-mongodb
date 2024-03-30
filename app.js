const { MongoClient, ObjectId } = require('mongodb');
const dns = require('./database.js');
const accounts = require('./dataset.js');

const client = new MongoClient(dns);
const dbname = 'bank';

const directConnection = async () => {
    await client.connect();
    const db = client.db(dbname);

    console.log(`Connected to the ${dbname}.`);
    return db;
};

const insertDocuments = async (db, collectionName, documents) => {
    const collection = db.collection(collectionName);
    return await collection.insertMany(documents);
}

const findDocument = async (db, collectionName, query) => {
    const collection = db.collection(collectionName);
    return await collection.findOne(query)
}

const findDocumentWithAggregate = async (db, collectionName, pipeline) => {
    const collection = db.collection(collectionName);
    return await collection.aggregate(pipeline).toArray();
}

const listAll = async (db, collectionName) => {
    const collection = db.collection(collectionName);

    const count = await collection.countDocuments();
    return await collection.find({}).toArray();
}

const countAll = async (db, collectionName) => {
    const collection = db.collection(collectionName);

    return await collection.countDocuments();
}

const updateAccount = async (db, collectionName, query, newValues) => {
    return await db.collection(collectionName).updateOne(query, newValues);
}

const main = async function() {
    try {
        const db = await directConnection();

        // Carga inicial
        // await insertDocuments(db, 'accounts', accounts);
        const pipeline = [
            {
                $match: {
                    account_type: {
                        $in: ['credit', 'loan']
                    },
                    balance: {
                        $gte: 500,
                        $lte: 700
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    account_id: 1,
                    account_holder: {
                        $toUpper: '$account_holder'
                    },
                    account_type: {
                        $toUpper: '$account_type'
                    },
                    balance: {
                        $concat: [
                            "R$ ",
                            {
                                $toString: {
                                    $round: ["$balance", 2]
                                }
                            }
                        ]
                    },
                    created_at: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: "$created_at"
                        }
                    },
                    last_updated: {
                        $dateToString: {
                            format: "%d/%m/%Y %H:%M",
                            date: "$last_updated"
                        }
                    }
                }
            },
            {
                $sort: {
                    account_holder: 1
                }
            }
        ];

        const accountsWithPipeline = await findDocumentWithAggregate(db, 'accounts', pipeline);
        console.table(accountsWithPipeline);

        /*
        const specificAccounts = await findDocument(db, 'accounts', { $and: [{ account_type: 'digital_checking' }, { account_id: { $eq: '203-4321-20014' } }] });
        console.log(specificAccounts);

        const newValue = {
            $set: {
                balance: 2445.12,
                last_updated: new Date()
            }
        }
        const resultProcessedUp = await updateAccount(db, 'accounts',  { account_id: { $eq : '203-4321-20014' } }, newValue);
        console.log('Account updated.');
        console.table(resultProcessedUp);

        let account = await findDocument(db, 'accounts', { account_id: { $eq : '203-4321-20014' } });
        if (account != null) {
            console.log(account);
        }
        else {
            console.log('Account [203-4321-20014] not found.');
        }

        const accountCredit = await findDocument(db, 'accounts', { account_id: '150-4321-20013' });
        const accountDebit = await findDocument(db, 'accounts', { account_id: '203-4321-20014' });

        console.table([accountCredit, accountDebit]);

        const newValueCredit = 200.00;

        const session = client.startSession();
        const transaction = session.withTransaction(async () => {
            try {
                await updateAccount(db, 'accounts', { account_id: { $eq : '150-4321-20013' } }, { $inc: { balance: newValueCredit } });
                console.log('Credit account updated.');

                await updateAccount(db, 'accounts', { account_id: { $eq : '203-4321-20014' } }, { $inc: { balance: -newValueCredit } });
                console.log('Debit account updated.');

                await session.commitTransaction();
            }
            catch (e) {
                console.error('Transaction failed.');
                await session.abortTransaction();
            }
            finally {
                session.endSession();
            }
        });

        if (transaction) {
            const accountCreditFinal = await findDocument(db, 'accounts', { account_id: '150-4321-20013' });
            const accountDebitFinal = await findDocument(db, 'accounts', { account_id: '203-4321-20014' });

            console.table([accountCreditFinal, accountDebitFinal]);
        }
        */

        /* Lista tudo
        const list = await listAll(db, 'accounts');
        console.table(list);
        */
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
        console.log('Database connection closed.')
    }
};


main();
