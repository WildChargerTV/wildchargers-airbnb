// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });
  
    return token;
};

// If a current user exists, restore it
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;
  
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }
  
      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }
  
      if (!req.user) res.clearCookie('token');
  
      return next();
    });
};

// If there is no current user, return an error
const requireAuthentication = function (req, _res, next) {
  if(!req.user) {
    console.log('\u001b[1;33m' + 'User authentication requested, result: ' + '\u001b[1;31m' + 'FAIL' + '\u001b[0m');
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
  }

  console.log('\u001b[1;33m' + 'User authentication requested, result: ' + '\u001b[1;32m' + 'SUCCESS' + '\u001b[0m');
  if (req.user) return next();
};

// Check if the user is the owner of an Instance
// REQUIRES additional params passed into req.body
const requireAuthorization =  async (req, res, next) => {
  const { type, instance } = req.body;
  if(
    (type === 'Spot' && instance.ownerId !== req.user.id) ||
    (type === 'Review' && instance.userId !== req.user.id)
  ) {
    console.log('\u001b[1;33m' + 'User authorization requested, result: ' + '\u001b[1;31m' + 'FAIL' + '\u001b[0m');
    res.status(403);
    return res.json({ message: `Forbidden: ${type} is not owned by the current User` });
  }
  
  console.log('\u001b[1;33m' + 'User authentication requested, result: ' + '\u001b[1;32m' + 'SUCCESS' + '\u001b[0m');
  return next();
}

module.exports = { setTokenCookie, restoreUser, requireAuthentication, requireAuthorization };