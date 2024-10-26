import Router from 'express-promise-router';
const router = Router();

import authMiddleware from '../middleware/auth.js'
import Jwt from 'jsonwebtoken';
const jwt = Jwt;

import Dotenv from 'dotenv';
const dotenv = Dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

router.get('/register', async (req, res, next) => {
    const { cookie } = req.headers

    if(cookie){
        return res.redirect('authenticate')
    }
    
    res.render('register.ejs')
});

router.get('/login', async (req, res, next) => {
    const { cookie } = req.headers

    if(cookie){
        return res.redirect('authenticate')
    }

    res.render('login.ejs')
})

router.get('/authenticate', authMiddleware, async (req, res, next) => {
    const token = req.cookies.token;
    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if(err) return res.redirect('/');

        res.render('dashboard.ejs', {name: decoded.name})
    })
})

export default router;