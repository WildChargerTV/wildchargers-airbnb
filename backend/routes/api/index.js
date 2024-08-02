// backend/routes/api/index.js
const router = require('express').Router();

const { restoreUser } = require('../../utils/auth.js');

// Connect restoreUser middleware to the API router
    // If current user session is valid, set req.user to the user in the database
    // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/bookings', require('./bookings.js'));

const imagesRouter = require('./images.js')
router.use('/review-images', imagesRouter);
router.use('/spot-images', imagesRouter);

router.use('/reviews', require('./reviews.js'));

router.use('/session', require('./session.js'));

router.use('/spots', require('./spots.js'));

router.use('/users', require('./users.js'));

router.post('/test', (req, res) => {
  return res.json({ 
    message: 'Test Endpoint: check your request body here!',
    requestBody: req.body 
  });
});

module.exports = router;
