// backend/routes/api/users.js
const express = require('express')
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Validate a signup (NOT an endpoint)
const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Invalid email'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Username is required'),
    check('username')
      .not()
      .isEmail()
      //.withMessage('Username cannot be an email'),
      .withMessage('Username is required'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more'),
    check('firstName')
      .exists({ checkFalsy: true })
      .withMessage('First Name is required'),
    check('lastName')
      .exists({ checkFalsy: true })
      .withMessage('Last Name is required'),
    handleValidationErrors
];

// Sign up
router.post('/', validateSignup, async (req, res, next) => {
    const { email, password, username, firstName, lastName } = req.body;
    const hashedPassword = bcrypt.hashSync(password);

    let user;
    try {
      user = await User.create({ email, username, hashedPassword, firstName, lastName });
    } catch(err) { // Handle unique constraint violations here
      const nextErr = new Error('User already exists');
      const errors = {};

      err.errors.forEach((error) => errors[error.path] = `User with that ${error.path} already exists`);
      nextErr.errors = errors;
      return next(nextErr);
    } 
    
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    };
    await setTokenCookie(res, safeUser);

    res.status(201);
    return res.json({ user: safeUser });
});

module.exports = router;