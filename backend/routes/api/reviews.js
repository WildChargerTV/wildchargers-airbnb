// backend/routes/api/reviews.js
const express = require('express');

const { requireAuthentication, requireAuthorization } = require('../../utils/auth');
const { findInstance } = require('../../utils/search');
const { validateImage, validateReview } = require('../../utils/validation');
require('dotenv').config();
require('express-async-errors');

const { User, Review, Image, Spot } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// GET all Reviews written by the current User
router.get('/current', requireAuthentication, async (req, res) => {
    let reviews = await Review.findAll({
        attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt'],
        include: [
            { model: User, attributes: ['id', 'firstName', 'lastName'] },
            { model: Spot, attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'] },
            { model: Image, as: 'ReviewImages', attributes: ['id', 'url'] }
        ],
        where: { userId: {[Op.eq]: req.user.id} }
    }).then(async (result) => {
        const arr = [];
        for await (const review of result) {
            const json = review.toJSON();
            const image = await Image.findOne({
                where: {
                    imageableType: 'Spot',
                    imageableId: json.Spot.id,
                    preview: true
                }
            });
            json.Spot.previewImage = image.url;
            arr.push(json);
        }
        return arr;
    });
    return res.json({ Reviews: reviews });
});

// POST an Image to a Review
router.post('/:reviewId/images', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Review';
    req.body.Model = Review;
    req.body.param = req.params.reviewId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, validateImage, async (req, res) => {
    const review = req.body.instance;
    const { url, preview } = req.body;

    // Ensure there are no more than 10 Images per Review
    const imgCount = await Image.count({
        where: {
            imageableType: { [Op.eq]: 'Review' },
            imageableId: { [Op.eq]: req.params.reviewId }
        }
    });
    if(imgCount >= 10) {
        res.status(403);
        return res.json({ message: 'Forbidden: Maximum image limit of 10 reached for this Review' });
    }

    const image = await Image.create({
        url,
        imageableType: 'Review',
        imageableId: review.id,
        preview
    });

    res.status(201);
    return res.json({
        id: image.id,
        url: image.url
    });
});

// PUT an existing Review
router.put('/:reviewId', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Review';
    req.body.Model = Review;
    req.body.param = req.params.reviewId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, validateReview, async (req, res) => {
    const foundReview = req.body.instance;
    const { review, stars } = req.body;

    foundReview.set({review, stars});
    await foundReview.save();
    return res.json(foundReview);
});

// DELETE an existing review
router.delete('/:reviewId', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Review';
    req.body.Model = Review;
    req.body.param = req.params.reviewId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, async (req, res) => {
    const review = req.body.instance;
    await review.destroy();
    return res.json({ message: 'Successfully deleted' });
});

module.exports = router;