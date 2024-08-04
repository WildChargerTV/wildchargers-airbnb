// backend/routes/api/spots.js
const express = require('express')

const { check } = require('express-validator');
const { requireAuthentication, requireAuthorization } = require('../../utils/auth')
const { handleValidationErrors } = require('../../utils/validation');
require('dotenv').config();
require('express-async-errors');

const { User, Spot, Image, Sequelize, Review, Booking } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// Validate a new Spot
const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be within -180 and 180'),
    check('name')
        .exists({ checkFalsy: true }).withMessage('Name must be less than 50 characters') // TODO why is it stopping here?
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('Price per day must be a positive number'),
    handleValidationErrors
];

// Validate a new Image
const validateImage = [
    check('url')
        .exists({ checkFalsy: true })
        .isURL()
        .withMessage('URL does not exist or is invalid'),
    check('preview')
        .isBoolean()
        .withMessage('Value passed into preview was not a boolean'),
    handleValidationErrors
];

// Validate a new Review
const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

// Validate a new Booking
const validateBooking = async (req, _res, next) => {
    let { startDate, endDate } = req.body;
    const errors = {};

    // Translate the start & end dates to Date objects. Discard hour differentials from Date.now().
    // This allows for proper comparison if booking dates are the same.
    startDate = new Date(startDate).setHours(0, 0, 0, 0);
    endDate = new Date(endDate).setHours(0, 0, 0, 0);
    let nowDate = new Date(Date.now()).setHours(0, 0, 0, 0);

    // BEGIN Body Validation Errors
    // 1. startDate cannot be in the past
    if(startDate < nowDate) errors['startDate'] = 'startDate cannot be in the past';
    //2. endDate cannot be on or before startDate
    if(endDate <= startDate) errors['endDate'] = 'endDate cannot be on or before startDate';
    if(errors.startDate || errors.endDate) {
        const nextErr = new Error('Bad Request');
        nextErr.errors = errors;
        nextErr.status = 400;
        return next(nextErr);
    }
    // END Body Validation Errors

    // BEGIN Booking conflict
    // TODO port this to be handled by Sequelize unique constraints maybe
    await Booking.findAll({ where: { spotId: { [Op.eq]: req.body.param } } })
    .then(async (result) => {
        for await (const booking of result) {
            const json = booking.toJSON();
            let bookingStart = new Date(json.startDate).setHours(0, 0, 0, 0);
            let bookingEnd = new Date(json.endDate).setHours(0, 0, 0, 0);

            // 1. startDates cannot conflict
            if(startDate === bookingStart) errors['startDate'] = 'Start date conflicts with an existing booking';
            // 2. endDates cannot conflict
            if(endDate === bookingEnd) errors['endDate'] = 'End date conflicts with an existing booking';
        }
        return result;
    });
    if(errors.startDate || errors.endDate) {
        const nextErr = new Error('Sorry, this Spot is already booked for the specified dates');
        nextErr.errors = errors;
        nextErr.status = 403;
        return next(nextErr);
    }
    // END Booking conflict

    return next();
}

// Verify the existence of a Spot, if the URL has a spotId
const findInstance = async (req, res, next) => {
    const { type, Model, param, options } = req.body;
    const target = await Model.findByPk(param, options);

    if(!target.toJSON()?.id) { // TODO oddity: some custom columns can cause an object with all null values to be returned rather than no object. Can this be avoided?
        res.status(404);
        return res.json({ message: `${type} couldn't be found` });
    } else {
        req.body.instance = target;
        return next();
    }
}

// GET all Spots
router.get('/', async (_req, res) => {
    const spots = await Spot.findAll({
        attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt',
            [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgRating'],
            [Sequelize.col('url'), 'previewImage']
        ],
        separate: true,
        include: [
            {
                model: Review,
                attributes: [],
                group: Spot.id
            },
            {
                model: Image,
                as: 'SpotImages',
                attributes: [],
                where: { preview: { [Op.eq]: true } }
            }
        ]
    });
    return res.json({ Spots: spots });
});

// GET all Spots owned by the current User
router.get('/current', requireAuthentication, async (req, res) => {
    const spots = await Spot.findAll({
        attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt',
            [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgRating'],
            [Sequelize.col('url'), 'previewImage']
        ],
        include: [
            {
                model: Review,
                attributes: [],
                group: Spot.id
            },
            {
                model: Image,
                as: 'SpotImages',
                attributes: [],
                where: { preview: { [Op.eq]: true } }
            }
        ],
        where: { ownerId: { [Op.eq]: req.user.id } }
    });
    return res.json({ Spots: spots });
});

// GET one Spot
router.get('/:spotId', (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {
        attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt',
            [Sequelize.fn('COUNT', Sequelize.col('reviews.id')), 'numReviews'], // TODO why is this showing up as 2???
            [Sequelize.fn('AVG', Sequelize.col('reviews.stars')), 'avgStarRating']
        ],
        include: [
            { model: Image, as: 'SpotImages' },
            { model: Review, attributes: ['id', 'stars'], where: { spotId: req.params.spotId }}, 
            { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] }
        ],
    }
    return next();
}, findInstance, (req, res) => res.json(req.body.instance));

// GET all Bookings by a Spot's id
router.get('/:spotId/bookings', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, async (req, res) => {
    const spot = req.body.instance;

    // Determine what attributes to include in the booking output based on authorization
    let attributes = [], include = [];
    if(spot.ownerId === req.user.id){
        attributes = ['id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
        include = [{ model: User, attributes: ['id', 'firstName', 'lastName'] }];
    } else attributes = ['spotId', 'startDate', 'endDate'];

    // Get the bookings
    const bookings = await Booking.findAll({ attributes, include, where: { spotId: { [Op.eq]: spot.id } }
    }).then(async (result) => {
        if(spot.ownerId !== req.user.id) return result;

        // Filter each booking to necessary values only
        const arr = [];
        for await (const booking of result) {
            const json = booking.toJSON();
            const newBooking = { User: json.User, id: json.id, spotId: json.spotId, userId: json.userId, startDate: json.startDate, endDate: json.endDate, createdAt: json.createdAt, updatedAt: json.updatedAt};
            arr.push(newBooking);
        }
        return arr;
    });
    return res.json({ Bookings: bookings });
});

// GET all Reviews by a Spot's id
router.get('/:spotId/reviews', (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, async (req, res) => {
    const spot = req.body.instance;
    const reviews = await Review.findAll({
        attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt'],
        include: [
            { model: User, attributes: ['id', 'firstName', 'lastName'] },
            { model: Image, as: 'ReviewImages', attributes: ['id', 'url'] }
        ],
        where: { spotId: { [Op.eq]: spot.id } }
    });
    return res.json({ Reviews: reviews });
});

// POST a new Spot
router.post('/', requireAuthentication, validateSpot, async (req, res, next) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    
    let spot;
    try {
        spot = await Spot.create({ 
            ownerId: req.user.id,
            address, city, state, country, lat, lng, name, description, price 
        });
    } catch(err) { // Handle unique constraint violations here
        const nextErr = new Error('Spot already exists');

        const errors = {};
        err.errors.forEach((error) => errors[error.path] = `Spot with that ${error.path} already exists`);

        nextErr.errors = errors;
        return next(nextErr);
    }

    res.status(201);
    return res.json(spot);
});

// POST a new Booking to a Spot
router.post('/:spotId/bookings', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, validateBooking, async (req, res, next) => {
    const spot = req.body.instance;
    const { startDate, endDate } = req.body;

    // validateBooking ensures dates are not in conflict
    let booking;
    try {
        booking = await Booking.create({
            spotId: spot.id,
            userId: req.user.id,
            startDate, endDate
        });
    } catch(err) { return next(err); }

    res.status(201);
    return res.json(booking);
});

// POST a new Image to a Spot
router.post('/:spotId/images', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, validateImage, async (req, res, next) => {
    const spot = req.body.instance;
    const { url, preview } = req.body;

    const imgCount = await Image.count({
        where: {
            imageableType: { [Op.eq]: 'Spot' },
            imageableId: { [Op.eq]: spot.id }
        }
    });

    if(imgCount >= 10) {
        res.status(403);
        return res.json({ message: 'Forbidden: Maximum image limit of 10 reached for this Spot '});
    }

    let image;
    try {
        image = await Image.create({
            url,
            imageableType: 'Spot',
            imageableId: spot.id,
            preview
        });
    } catch(err) { return next(err); }

    res.status(201);
    return res.json({
        id: image.id,
        url: image.url,
        preview: image.preview
    });
});

// POST a new Review to a Spot
router.post('/:spotId/reviews', validateReview, requireAuthentication, (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, validateReview, async (req, res) => {
    const spot = req.body.instance;
    const { review, stars } = req.body;

    // Final validation: Ensure the User doesn't already have a Review for the Spot
    const foundReview = await Review.findAll({
        where: {
            userId: { [Op.eq]: req.user.id },
            spotId: { [Op.eq]: req.params.spotId }
        }
    });
    if(foundReview.length) {
        res.status(500);
        return res.json({ message: 'User already has a Review for this Spot' });
    }

    const newReview = await Review.create({
        userId: req.user.id,
        spotId: spot.id,
        review, stars
    });

    // For some odd reason, createdAt and updatedAt get swapped when making a new Review. This just fixes that.
    res.status(201);
    return res.json({ 
        id: newReview.id, userId: newReview.userId, spotId: newReview.spotId, 
        review: newReview.review, stars: newReview.stars,
        createdAt: newReview.createdAt, updatedAt: newReview.updatedAt
    });
});

// PUT an existing Spot
router.put('/:spotId', validateSpot, requireAuthentication, (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, validateSpot, async (req, res) => {
    const spot = req.body.instance;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    spot.set({ address, city, state, country, lat, lng, name, description, price });
    await spot.save();
    return res.json(spot);
});

// DELETE an existing Spot
router.delete('/:spotId', requireAuthentication, async (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, async (req, res) => {
    const spot = req.body.instance;
    await spot.destroy();
    return res.json({ message: 'Successfully deleted' });
});

module.exports = router;