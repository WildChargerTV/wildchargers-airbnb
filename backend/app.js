// backend/app.js
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { ValidationError } = require('sequelize');

const { environment } = require('./config');
const isProduction = environment === 'production';

const routes = require('./routes');

const app = express();

app.use(morgan('dev'));

app.use(cookieParser());
app.use(express.json());

// Security Middleware
if(!isProduction) app.use(cors()); // Enable cors only in dev mode
// Use helmet for security headers
app.use(helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
}));
// Set the _csrf token and create req.csrfToken method
app.use(csurf({
    cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
    }
}));

app.use(routes); // Connect all the routes

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
      let errors = {};
      for (let error of err.errors) {
        errors[error.path] = error.message;
      }
      err.title = 'Validation error';
      err.errors = errors;
    }
    next(err);
  });

// Error formatter
// TODO running in production did not remove title or stack???
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);

    // If no error list, then assume none exists and only return message
    if(!err.errors) res.json({message: err.message});
    else res.json({
      //title: isProduction ? null : err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      //stack: isProduction ? null : err.stack
    });
  });

// Export the app
module.exports = app;