import Router from 'express-promise-router';
const router = Router();

import Bcrypt from 'bcrypt';
const bcrypt = Bcrypt;

import Jwt from 'jsonwebtoken';
const jwt = Jwt;

import Dotenv from 'dotenv';
const dotenv = Dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()

import validateUser from '../validation/user.js';
import validateCredentials from '../validation/login.js';

import authMiddleware from '../middleware/auth.js'

router.post('/register', async (req, res, next) => {
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
        return res.status(400).send(response.error.details[1])
    }
    
    let hashedPassword = await bcrypt.hash(validatedData.password, 10) // hash password

    try{
        let user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
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

        // return res.status(201).redirect('/login')
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

router.post('/login', async (req, res, next) => {
    const validatedData = {
        email: req.body.email,
        password: req.body.password,
    }; 

    const response = validateCredentials(validatedData)

    if(response.error){ // if the fields don't meet the requirements
        return res.status(400).send(response.error.details[1])
    }

    try {
        let user = await prisma.user.findUnique({
            where: {
                email: validatedData.email
            }
        })

        if(!user){ // if no email found from the request body
            return res.status(400).json({
                status: 'failed',
                message: `Invalid email or password`
            })
        }

        let isPasswordCorrect = await bcrypt.compare(validatedData.password, user.password)

        if(!isPasswordCorrect){ // if entered password is false or incorrect
            return res.status(400).json({
                status: 'failed',
                message: `Invalid email or password`
            })
        }

        let token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET_KEY, {expiresIn: '6h'})

        return res.json({
            message: `Logged in as ${user.name}`,
            data: {
                user,
                token
            }
        })

        // res.cookie('token', token, {
        //     httpOnly: true
        // })
        // res.redirect('/auth/authenticate')

    } catch(err) {
        next(err)
    }
})

router.get('/authenticate', authMiddleware, (req, res) => {
        return res.json({
            status: 'success',
            message: `Authenticated as ${req.user.name}`
        })
})

export default router;