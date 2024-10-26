import Router from 'express-promise-router';
const router = Router();

import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient();

import validateAccount from '../validation/account.js';

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Add a new bank account
 *     description: This endpoint creates a new bank account for a user, with a starting balance.
 *     tags:
 *       - Accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the user the account belongs to.
 *               bank_name:
 *                 type: string
 *                 example: Bank of America
 *               bank_account_number:
 *                 type: string
 *                 example: 1234567890
 *               balance:
 *                 type: number
 *                 example: 1000.00
 *                 description: Initial balance for the new bank account. Must be positive.
 *     responses:
 *       201:
 *         description: Successfully created the bank account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: successfully added account for user_id 1
 *       400:
 *         description: Validation error. Invalid input fields or balance is not positive.
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
 *                   example: Balance must be a positive number
 *       409:
 *         description: Conflict error. Either the user_id does not exist, or the bank account number already exists.
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
 *                   example: No user with user_id 1
 *       500:
 *         description: Internal server error.
 */
router.post('/', async (req, res, next) => {
    const validatedData = {
        user_id: Number(req.body.user_id),
        bank_name: req.body.bank_name,
        bank_account_number: req.body.bank_account_number,
    };

    const response = validateAccount(validatedData)

    const balance = Number(req.body.balance);

    if(response.error){ // if the fields don't meet the requirements
        return res.status(400).send(response.error.details)
    } else if(isNaN(balance) || balance < 0){ // if the balance is a NaN or negative
        return res.status(400).json({
            status: 'failed',
            message: 'Balance must be a positive number'
        })
    }

    try {
        let account = await prisma.bank_Account.create({
            data: {
                user_id: validatedData.user_id,
                bank_name: validatedData.bank_name,
                bank_account_number: validatedData.bank_account_number,
                balance: balance
            }
        })
        
        return res.status(201).json({
            status: 'success',
            message: `successfully added account for user_id ${account.user_id}`
        })
    } catch(err) {
        if(err.code === 'P2003'){ // if no matching data for entered user_id
            return res.status(409).json({
                status: 'failed',
                message: `No user with user_id ${validatedData.user_id}`
            })
        } else if(err.code === 'P2002'){ // if account number already exists
            return res.status(409).json({
                status: 'failed',
                message: `Bank account number ${validatedData.bank_account_number} has already taken`
            })
        }
        next(err);
    }
})

router.get('/', async (req, res, next) => {
    try {
        let accounts = await prisma.bank_Account.findMany({
            orderBy: {
                id: 'asc'
            }
        })

        return res.json({
            status: 'success',
            accounts_data: accounts,
        })
    } catch(err) {
        next(err);
    }
})

router.get('/:accountId', async (req, res, next) => {
    const accId = Number(req.params.accountId)
    try {
        let account = await prisma.bank_Account.findUnique({
            where: {
                id: accId
            },
            include: {user: true}
        })

        if(!account){ // if no matching data by entered account's id
            return res.status(404).json({
                status: 'failed',
                message: `Account with id ${accId} not found`
            })
        }

        return res.json({
            status: 'success',
            account_data: account
        })
    } catch(err) {
        next(err);
    }
})

router.delete('/:accountId', async (req, res, next) => {
    const accId = Number(req.params.accountId)
    try {
        let account = await prisma.bank_Account.delete({
            where: {
                id: accId
            }
        })

        return res.json({
            status: 'success',
            message: `Account with id ${accId} deleted successfully`,
            deleted_account: account
        })
    } catch(err) {
        if(err.code === 'P2025'){ // if no matching data by entered account's id
            return res.status(404).json({
                status: 'failed',
                message: `Account with id ${accId} not found`
            })
        }
        next(err)
    }
})

export default router;