// backend/routes/api/reviews.js
const express = require('express');

const { check } = require('express-validator');
const { requireAuth } = require('../../utils/auth')
const { handleValidationErrors } = require('../../utils/validation');
require('dotenv').config();
require('express-async-errors');

const { Sequelize, User, Review, Image, Spot } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// Validate a new Review
const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({
            min: 1,
            max: 5
        })
        .withMessage('Stars must be an integer from 1 to 5'),
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

// GET all Reviews written by the current User
router.get('/current', requireAuth, async (req, res) => {
    let reviews = await Review.findAll({
        attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt'],
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Spot,
                attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
            },
            {
                model: Image,
                as: 'ReviewImages',
                attributes: ['id', 'url']
            }
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
        return(arr)
    });

    return res.json({
        Reviews: reviews
    });
});

// POST an Image to a Review
router.post('/:reviewId/images', validateImage, requireAuth, async (req, res) => {
    const { url, preview } = req.body;
    const review = await Review.findByPk(req.params.reviewId);
    const images = await Image.findAll({
        where: {
            imageableType: {[Op.eq]: 'Review'},
            imageableId: {[Op.eq]: req.params.reviewId}
        }
    });

    if(!review) {
        res.status(404);
        return res.json({
            message: 'Review couldn\'t be found'
        });
    }

    if(review.userId !== req.user.id) {
        res.status(403);
        return res.json({
            message: 'Forbidden: Review is not owned by the current User'
        });
    }

    // TODO untested since this is one of the longer ones to test.
    if(images.length >= 10) {
        res.status(403);
        return res.json({
            message: 'Forbidden: Maximum number of Images for this resource was reached'
        });
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
router.put('/:reviewId', validateReview, requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const foundReview = await Review.findByPk(req.params.reviewId);

    if(!foundReview) {
        res.status(404);
        return res.json({ message: 'Review couldn\'t be found' });
    }
    if(foundReview.userId !== req.user.id) {
        res.status(403);
        return res.json({ message: 'Forbidden: Review is not owned by the current User' });
    }

    foundReview.set({review, stars});
    await foundReview.save();
    return res.json(foundReview);
});

// DELETE an existing review
router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    const review = await Review.findByPk(req.params.reviewId);

    if(!review) {
        res.status(404);
        return res.json({
            message: 'Review couldn\'t be found'
        });
    }

    if(review.userId !== req.user.id) {
        res.status(403);
        return res.json({
            message: 'Forbidden: Review is not owned by the current User'
        });
    }

    await review.destroy();

    return res.json({
        message: 'Successfully deleted'
    });
});

module.exports = router;