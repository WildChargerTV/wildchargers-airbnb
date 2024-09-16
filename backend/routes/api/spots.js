// backend/routes/api/spots.js
const express = require('express')

const { requireAuthentication, requireAuthorization } = require('../../utils/auth');
const { findInstance } = require('../../utils/search');
const { validateSpot, validateSpotParams, validateImage, validateReview, validateBooking } = require('../../utils/validation');
require('dotenv').config();
require('express-async-errors');

const { User, Spot, Image, Sequelize, Review, Booking } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

//* GET all Spots
router.get('/', validateSpotParams, async (req, res) => {
    const query = {
        attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'],
        include: [
            { model: Review }, 
            { model: Image, as: 'SpotImages', where: { preview: { [Op.eq]: true } } }
        ],
        
    };

    // Query checkers
    const page = req.query.page === undefined ? 1 : parseInt(req.query.page);
    const size = req.query.size === undefined ? 20 : parseInt(req.query.size);
    if(page >= 1 && size >= 1) {
        query.limit = size;
        query.offset = size * (page - 1);
    }
    query.where = {
        lat: {
            [Op.lte]: (req.query.maxLat === undefined) ? 90 : req.query.maxLat,
            [Op.gte]: (req.query.minLat === undefined) ? -90 : req.query.minLat
        },
        lng: {
            [Op.lte]: (req.query.maxLng === undefined) ?  180 : req.query.maxLng,
            [Op.gte]: (req.query.minLng === undefined) ? -180 : req.query.minLng
        },
        price: {
            [Op.gte]: (req.query.minPrice === undefined) ? 0 : req.query.minPrice
        }
    }
    if(req.query.maxPrice) {
        query.where.price = {
            [Op.gte]: (req.query.minPrice === undefined) ? 0 : req.query.minPrice,
            [Op.lte]: req.query.maxPrice
        }
    }

    // Find the spots
    const spots = await Spot.findAll(query)
    .then(async (result) => { // TODO why do existent null entries spawn from these queries?
        const arr = [];

        for await (const spot of result) {
            const json = spot.toJSON();

            // avgRating column replacement
            json.avgRating = json.Reviews.reduce((acc, review) => acc + review.stars, 0) / json.Reviews.length;

            // previewImage column replacement
            json.previewImage = json.SpotImages[0].url;

            delete json.Reviews;
            delete json.SpotImages;
            if(json.id !== null) arr.push(json);
        }
        return arr;
    });
    return res.json({
        Spots: spots,
        page: page,
        size: size
    });
});

//* GET all Spots owned by the current User
router.get('/current', requireAuthentication, async (req, res) => {
    const spots = await Spot.findAll({
        attributes: [
            'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'
        ],
        include: [
            { model: Review, group: Spot.id },
            { model: Image, as: 'SpotImages', where: { preview: { [Op.eq]: true } } }
        ],
        where: { ownerId: { [Op.eq]: req.user.id } }
    }).then(async (result) => {
        const arr = [];

        for await (const spot of result) {
            const json = spot.toJSON();

            // avgRating column replacement
            json.avgRating = json.Reviews.reduce((acc, review) => acc + review.stars, 0) / json.Reviews.length;
            // previewImage column replacement
            json.previewImage = json.SpotImages[0].url;

            delete json.Reviews;
            delete json.SpotImages;
            if(json.id !== null) arr.push(json);
        }
        return arr;
    });
    return res.json({ Spots: spots });
});

//! GET one Spot
router.get('/:spotId', (req, _res, next) => {
    req.body.type = 'Spot';
    req.body.Model = Spot;
    req.body.param = req.params.spotId;
    req.body.options = {
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'],
        include: [
            { model: Image, as: 'SpotImages' },
            { model: Review, where: { spotId: req.params.spotId }, required: false }, 
            { model: User, as: 'Owner' }
        ],
    }
    return next();
}, findInstance, (req, res) => {
    const json = req.body.instance.toJSON();

    // numReviews column replacement
    json.numReviews = json.Reviews.length;
    // avgStarRating column replacement
    json.avgStarRating = json.Reviews.reduce((acc, review) => acc + review.stars, 0) / json.Reviews.length;

    delete json.Reviews;
    delete json.Owner.username;
    return res.json(json);
});

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
        return res.json({ message: 'Forbidden: Maximum image limit of 10 reached for this Spot'});
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
router.post('/:spotId/reviews', requireAuthentication, (req, _res, next) => {
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
router.put('/:spotId', requireAuthentication, (req, _res, next) => {
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