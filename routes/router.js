import userController from '../controllers/user.controller.js';
import accountController from '../controllers/account.controller.js';
import transactionController from '../controllers/transaction.controller.js';
import authController from '../controllers/auth.controller.js';
import authViewController from '../controllers/auth.view.js'

import express from 'express';
const app = express();

app.use('/auth/', authViewController)
app.use('/api/v1/auth', authController)
app.use('/api/v1/users', userController);
app.use('/api/v1/accounts', accountController);
app.use('/api/v1/transactions', transactionController);

export default app;