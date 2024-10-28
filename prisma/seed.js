import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create users
  await prisma.user.create({
    data: {
        name: 'Ahmad',
        email: 'Ahmad@example.com', 
        password: '$2a$12$A8xMlvKFUZ.pOTC8MdjqaeSETeeI3zURuQAqMIEHu/jQ4MbscC9.G',
        profile: {
            create: {
                identity_type: 'ID_CARD',
                identity_number: '00111111222222',
                address: 'Surabaya'
            }
        }
    }
  });

  // Create Bank Accounts
  await prisma.bank_Account.createMany({
    data: [
        {
            user_id: 1,
            bank_name: 'Mandiri',
            bank_account_number: '111111222222',
            balance: 100000
        },
        {
            user_id: 1,
            bank_name: 'BNI',
            bank_account_number: '222222333333',
            balance: 50000
        }
    ]
  })

  // Create Transaction
  await prisma.transaction.createMany({
    data: [
        {
            source_account_id: 1,
            destination_account_id: 2,
            amount: 10000
        },
        {
            source_account_id: 2,
            destination_account_id: 1,
            amount: 10000
        },
    ]
  });

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });