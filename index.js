import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import router from './routes/router.js';
// import path from 'path';

const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

app.use(router);

app.use(function(req, res, next) {
    return res.status(404).json({
        status: 'failed',
        message: 'Not found'
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        status: 'failed',
        message: 'Internal server error'
    })
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})