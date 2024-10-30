import Jwt from 'jsonwebtoken';
const jwt = Jwt;

import Dotenv from 'dotenv';
const dotenv = Dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

import express from 'express';
const app = express();

app.use(async function(req, res, next){
    const { authorization } = req.headers;
    // const token = req.cookies.token;
    
    try {
        if(!authorization || !authorization.startsWith('Bearer ')){
            throw {
                statusCode: 401,
                message: `Unauthorized`
            }
        }
        // if(!token){
        //     return res.status(401).json({
        //         status: 'failed',
        //         message: 'Unauthorized'
        //     })
        // }
    
        // Extract the token from "Bearer <token>"
        const token = authorization.split(' ')[1];
        
        jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
            if(err){
                throw {
                    statusCode: 401,
                    message: err.message
                }
            }
    
            req.user = decoded;
            next();
        })
    } catch(err) {
        if(err.statusCode){ // throw error block
            return res.status(err.statusCode).json({
                status: 'failed',
                message: err.message
            })
        }
        next(err);
    }
})

export default app;