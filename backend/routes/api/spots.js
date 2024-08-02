// backend/routes/api/spots.js
const express = require('express')

const { check } = require('express-validator');
const { requireAuth } = require('../../utils/auth')
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
const validateBooking = [
    check('startDate')
        .exists({ checkFalsy: true })
        .custom((value, { req } ) => {
            console.log("YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO" + value.toDate());
            return typeof value.toDate();
        })
        .withMessage('startDate cannot be in the past'),
    check('endDate')
        .exists({ checkFalsy: true })
        .isISO8601().toDate()
        .isAfter('startDate')
        .withMessage('endDate cannot be on or before startDate'),
    handleValidationErrors
];

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
router.get('/current', requireAuth, async (req, res) => {
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
    })

    return res.json({ Spots: spots });
});

// GET one Spot
router.get('/:spotId', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId, {
        include: [
            {
                model: Image,
                as: 'SpotImages'
            },
            {
                model: User,
                as: 'Owner',
                attributes: ['id', 'firstName', 'lastName']
            }
        ]
    });

    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }

    return res.json(spot);
});

// GET all Bookings by a Spot's id
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }

    let attributes = [], include = [];
    if(spot.ownerId === req.user.id){
        attributes = ['id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
        include = [{ model: User, attributes: ['id', 'firstName', 'lastName'] }];
    } else
        attributes = ['spotId', 'startDate', 'endDate'];

    const bookings = await Booking.findAll({
        attributes, include,
        where: { spotId: { [Op.eq]: spot.id } }
    }).then(async (result) => {
        if(spot.ownerId !== req.user.id)
            return result;
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
router.get('/:spotId/reviews', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }

    const reviews = await Review.findAll({
        attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt'],
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Image,
                as: 'ReviewImages',
                attributes: ['id', 'url']
            }
        ],
        where: { spotId: { [Op.eq]: spot.id } }
    });

    return res.json({ Reviews: reviews });
});

// POST a new Spot
router.post('/', validateSpot, requireAuth, async (req, res, next) => {
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
router.post('/:spotId/bookings', requireAuth, async (req, res, next) => {
    const { startDate, endDate } = req.body;
    const spot = await Spot.findByPk(req.params.spotId);

    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }
    if(spot.ownerId !== req.user.id){
        res.status(403);
        return res.json({ message: 'Forbidden: Spot is not owned by the current User' });
    }

    let booking;
    try {
        booking = await Booking.create({
            spotId: spot.id,
            userId: req.user.id,
            startDate, endDate
        });
    } catch(err) { // Handle unique constraint violations here
        const nextErr = new Error('Sorry, this spot is already booked for the specified dates');
        const errors = {};

        err.errors.forEach((error) => {
            if(error.path === 'startDate')
                errors[error.path] = 'Start date conflicts with an existing booking';
            else if(error.path === 'endDate')
                errors[error.path] = 'End date conflicts with an existing booking';
        });
        nextErr.errors = errors;
        return next(nextErr);
    }

    res.status(201);
    return res.json(booking);
});

// POST a new Image to a Spot
router.post('/:spotId/images', validateImage, requireAuth, async (req, res, next) => {
    const { url, preview } = req.body;
    const spot = await Spot.findByPk(req.params.spotId);

    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }
    if(spot.ownerId !== req.user.id){
        res.status(403);
        return res.json({ message: 'Forbidden: Spot is not owned by the current User' });
    }

    const imgCount = await Image.count({
        where: {
            imageableType: { [Op.eq]: 'Spot' },
            imageableId: { [Op.eq]: spot.id }
        }
    });
    console.log(imgCount);
    if(imgCount >= 10) {
        res.status(403);
        return res.json({ message: 'Forbidden: Maximum image limit of 10 reached for this Spot '});
    }

    let image;
    try {
        // TODO why is the default scope not applying here
        image = await Image.create({
            url,
            imageableType: 'Spot',
            imageableId: spot.id,
            preview
        });
    } catch(err) { // No unique constraints, this is purely a precaution
        return next(err);
    }

    res.status(201);
    return res.json({
        id: image.id,
        url: image.url,
        preview: image.preview
    });
});

// POST a new Review to a Spot
router.post('/:spotId/reviews', validateReview, requireAuth, async (req, res, next) => {
    const { review, stars } = req.body;
    const spot = await Spot.findByPk(req.params.spotId);
    const foundReview = await Review.findAll({
        where: {
            userId: { [Op.eq]: req.user.id },
            spotId: { [Op.eq]: req.params.spotId }
        }
    });

    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }
    if(foundReview.length) {
        res.status(500);
        return res.json({ message: 'User already has a Review for this Spot' });
    }

    const newReview = await Review.create({
        userId: req.user.id,
        spotId: spot.id,
        review, stars
    }).then(async (result) => {
        // For some odd reason, createdAt and updatedAt get swapped when making a new Review. This just fixes that.
        const json = result.toJSON();
        const val = { id: json.id, userId: json.userId, spotId: json.spotId, review: json.review, stars: json.stars, updatedAt: json.updatedAt, createdAt: json.createdAt };
        console.log(val);
        return val;
    });

    // TODO createdAt and updatedAt are swapped for some reason
    res.status(201);
    return res.json(newReview);
});

// PUT an existing Spot
router.put('/:spotId', validateSpot, requireAuth, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const spot = await Spot.findByPk(req.params.spotId);

    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }

    if(spot.ownerId !== req.user.id){
        res.status(403);
        return res.json({ message: 'Forbidden: Spot is not owned by the current User' });
    }

    spot.set({ address, city, state, country, lat, lng, name, description, price });
    await spot.save();
    return res.json(spot);
});

// DELETE an existing Spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if(!spot) {
        res.status(404);
        return res.json({ message: 'Spot couldn\'t be found' });
    }
    if(spot.ownerId !== req.user.id){
        res.status(403);
        return res.json({ message: 'Forbidden: Spot is not owned by the current User' });
    }

    await spot.destroy();
    return res.json({ message: 'Successfully deleted' });
});


module.exports = router;