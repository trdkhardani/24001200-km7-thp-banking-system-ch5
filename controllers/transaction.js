import Router from 'express-promise-router';
const router = Router();

import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient();

import validateTransaction from '../validation/transaction.js';


/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: This endpoint creates a new transaction between two bank accounts. The transaction amount must not exceed the available balance from source account.
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source_account_id:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the source bank account (must belong to the authenticated user).
 *               destination_account_id:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the destination bank account.
 *               amount:
 *                 type: number
 *                 example: 100.00
 *                 description: The amount to transfer. Must be less than or equal to the source account's balance.
 *     responses:
 *       201:
 *         description: Transaction created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     source_account_id:
 *                       type: integer
 *                       example: 1
 *                     destination_account_id:
 *                       type: integer
 *                       example: 2
 *                     amount:
 *                       type: number
 *                       example: 100.00
 *                 source_account:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     bank_name:
 *                       type: string
 *                       example: Bank of America
 *                     bank_account_number:
 *                       type: string
 *                       example: 1234567890
 *                     balance:
 *                       type: number
 *                       example: 5000
 *                 destination_account:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     user_id:
 *                       type: integer
 *                       example: 2
 *                     bank_name:
 *                       type: string
 *                       example: Chase Bank
 *                     bank_account_number:
 *                       type: string
 *                       example: 9876543210
 *                     balance:
 *                       type: number
 *                       example: 5100
  *       400:
 *         description: Validation error. Input data does not meet the required format.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: '"amount" must be a positive number'
 *                   path:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["amount"]
 *                   type:
 *                     type: string
 *                     example: "number.positive"
 *                   context:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         example: "amount"
 *                       value:
 *                         type: number
 *                         example: 0
 *                       key:
 *                         type: string
 *                         example: "amount"
 *       409:
 *         description: Conflict error. Invalid account IDs, insufficient balance, or same account used as source and destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Cannot do transaction between same account
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */
router.post('/', async (req, res, next) => {
    const validatedData = {
        source_account_id: Number(req.body.source_account_id),
        destination_account_id: Number(req.body.destination_account_id),
        amount: Number(req.body.amount)
    };
    
    const response = validateTransaction(validatedData);

    if(response.error){ // if the fields don't meet the requirements
        return res.status(400).send(response.error.details);
    }
    
    try {
        let getSourceAccInfo = await prisma.bank_Account.findUnique({ // fetch data of source bank account
            where: {
                id: validatedData.source_account_id,
            }
        })

        let getDestAccInfo = await prisma.bank_Account.findUnique({ // fetch data of destination bank account
            where: {
                id: validatedData.destination_account_id
            }
        })

        if(!getSourceAccInfo || !getDestAccInfo){ // if getSourceAccInfo or getDestAccInfo can't find matching data of bank_account's id
            return res.status(409).json({
                status: 'failed',
                message: `Invalid account id`
            })
        } else if(validatedData.source_account_id === validatedData.destination_account_id){ // if the entered source_account_id and destination_account_id have the same id
            return res.status(409).json({
                status: 'failed',
                message: `Cannot do transaction between same account`
            })
        } else if(validatedData.amount > getSourceAccInfo.balance){ // if entered amount is greater than source bank account's balance
            return res.status(409).json({
                status: 'failed',
                message: `Insufficient balance`
            })
        }

        let transaction = await prisma.transaction.create({ // create transaction data
            data: {
                source_account_id: validatedData.source_account_id,
                destination_account_id: validatedData.destination_account_id,
                amount: validatedData.amount
            }
        })

        let updateSourceAccBalance = await prisma.bank_Account.update({ // update source bank_account's balance data
            where: {
                id: validatedData.source_account_id
            }, 
            data: {
                balance: Number(getSourceAccInfo.balance) - Number(validatedData.amount)
            }
        })

        let updateDestAccBalance = await prisma.bank_Account.update({ // update destination bank_account's balance data
            where: {
                id: validatedData.destination_account_id
            }, 
            data: {
                balance: Number(getDestAccInfo.balance) + Number(validatedData.amount)
            }
        })

        return res.status(201).json({
            status: 'success',
            transaction: transaction,
            source_account: updateSourceAccBalance,
            destination_account: updateDestAccBalance
        }) 
    } catch(err) {
        next(err)
    }
})

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Retrieve all transactions data
 *     description: This endpoint retrieves a list of all transactions, ordered by their ID in ascending order.
 *     tags:
 *       - Transactions
 *     responses:
 *       200:
 *         description: Successfully retrieved all transactions data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 transactions_data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       source_account_id:
 *                         type: integer
 *                         example: 1
 *                       destination_account_id:
 *                         type: integer
 *                         example: 2
 *                       amount:
 *                         type: number
 *                         example: 500.00
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/', async (req, res, next) => {
    try{
        let transactions = await prisma.transaction.findMany({
            orderBy: {
                id: 'asc'
            }
        })

        return res.json({
            status: 'success',
            transactions_data: transactions
        });
    } catch(err) {
        next(err)
    }
})

router.get('/:transaction', async (req, res, next) => {
    const transactionId = Number(req.params.transaction)
    try{
        let transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId,
            }, 
            include: {
                sourceAccount: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                destinationAccount: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if(!transaction){ // if no matching data by entered transaction's id
            return res.status(404).json({
                status: 'failed',
                message: `Transaction with id ${transactionId} not found`
            })
        }

        return res.json({
            status: 'success',
            transaction: transaction
        })
    } catch(err) {
        next(err)
    }
})

export default router;