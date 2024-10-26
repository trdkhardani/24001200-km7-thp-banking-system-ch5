import userController from '../controllers/user.js';
import accountController from '../controllers/account.js';
import transactionController from '../controllers/transaction.js';
import authController from '../controllers/auth.js';

import authMiddleware from '../middleware/auth.js'
import Jwt from 'jsonwebtoken';
const jwt = Jwt;

import Dotenv from 'dotenv';
const dotenv = Dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

import express from 'express';
const app = express();

app.get('/register', async (req, res, next) => {
    const { cookie } = req.headers

    if(cookie){
        return res.redirect('/dashboard')
    }
    
    res.render('register.ejs')
});

app.get('/login', async (req, res, next) => {
    const { cookie } = req.headers

    if(cookie){
        return res.redirect('/dashboard')
    }

    res.render('login.ejs')
})

app.get('/dashboard', authMiddleware, async (req, res, next) => {
    const token = req.cookies.token;
    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if(err) return res.redirect('/');

        res.render('dashboard.ejs', {name: decoded.name})
    })
})

app.use('/api/v1/auth', authController)
app.use('/api/v1/users', userController);
app.use('/api/v1/accounts', accountController);
app.use('/api/v1/transactions', transactionController);

export default app;