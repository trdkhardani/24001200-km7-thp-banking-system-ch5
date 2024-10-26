import Router from 'express-promise-router';
const router = Router();

import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()

import validateUser from '../validation/user.js';

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with a hashed password and profile details.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: john123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               identity_type:
 *                 type: string
 *                 enum: [ID_CARD, PASSPORT]
 *                 example: ID_CARD
 *               identity_number:
 *                 type: string
 *                 example: 1234567890
 *               address:
 *                 type: string
 *                 example: 123 Main St, Jakarta
 *     responses:
 *       201:
 *         description: User registered successfully.
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
 *                   example: Successfully added John Doe's data
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com  
 *                     password:
 *                       type: string
 *                       example: $2a$12$D/lWVGNdmlMW7RpXCEmDqOz4C6STECLUZeoIfxc9flHAQ3QRP7d66
 *       400:
 *         description: Validation error for user input.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: '"name" is not allowed to be empty'
 *                   path:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["name"]
 *                   type:
 *                     type: string
 *                     example: "string.empty"
 *                   context:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         example: "name"
 *                       value:
 *                         type: string
 *                         example: ""
 *                       key:
 *                         type: string
 *                         example: "name"
 *       409:
 *         description: Email already exists.
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
 *                   example: Email has already been taken
 */
router.post('/', async (req, res, next) => {
    const validatedData = {
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        identity_type: req.body.identity_type,
        identity_number: req.body.identity_number,
        address: req.body.address,
    }; 

    const response = validateUser(validatedData)

    if(response.error){ // if the fields don't meet the requirements
        return res.status(400).send(response.error.details)
    }
    
    validatedData.password = encrypt(validatedData.password) // encrypt password

    try{
        let user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: validatedData.password,
                profile: {
                    create: 
                        {
                            identity_type: validatedData.identity_type,
                            identity_number: validatedData.identity_number,
                            address: validatedData.address
                        }
                }
            },
        })

        return res.status(201).json({
            status: 'success',
            message: `Successfully added ${user.name}'s data`,
            user: user,
        })
    } catch(err){
        if(err.code === 'P2002'){ // if email already exists
            return res.status(409).json({
                status: 'failed',
                message: "Email has already been taken"
            })
        }
        next(err)
    }
})

router.get('/', async (req, res) => {
    let users = await prisma.user.findMany({
        orderBy: {
            id: 'asc'
        }
    })

    return res.json({
        status: 'success',
        users_data: users,
    })
})

router.get('/:userId', async (req, res, next) => {
    const userId = Number(req.params.userId)
    
    try {
        let user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {profile: true}
        })
    
        if(!user){ // if no matching data by entered user's id
            return res.status(404).json({
                status: 'failed',
                message: `User with id ${userId} not found`
            })
        }

        return res.json({
            status: 'success',
            user_data: user,
        })
    } catch(err) {
        next(err)
    }
})

export default router;