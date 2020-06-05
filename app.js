const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

mongoose.promise = global.Promise;
const isProduction = process.env.NODE_ENV === 'production';


const indexRouter = require('./app/routes/index');
const usersRouter = require('./app/routes/users');




const app = express();

app.use(cors());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(session({secret: 'simple-auth', cookie: {maxAge: 60000}, resave: false, saveUninitialized: false}));

if (!isProduction){
    app.use(errorHandler());
}

mongoose.connect('mongodb://localhost/simple-auth');
mongoose.set('debug', true);

require('./app/models/users');

if (!isProduction){
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
}

app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});


module.exports = app;