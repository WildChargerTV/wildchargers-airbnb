// backend/routes/api/bookings.js
const express = require('express')

const { check } = require('express-validator');
const { requireAuth } = require('../../utils/auth')
const { handleValidationErrors } = require('../../utils/validation');
require('dotenv').config();
require('express-async-errors');

const { User, Image, Review, Spot } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// DELETE an existing Image from a Review or a Spot
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const image = await Image.findByPk(req.params.imageId, { attributes: ['id', 'url', 'imageableType', 'imageableId', 'preview'] });

    // Takes the url and derives the intended imageableType from it, in the absence of an image to reference
    let imageableType = req.baseUrl.split('/')[2].split('-')[0];
    imageableType = imageableType[0].toUpperCase() + imageableType.slice(1);

    if(!image) {
        res.status(404);
        return res.json({ message: `${imageableType} Image couldn't be found` });
    }
    console.log(image.toJSON());
    
    let auth = false
    if(image.imageableType === 'Review') {
        const review = await Review.findByPk(image.imageableId);
        console.log(review);
        if(review.userId === req.user.id)
            auth = true;
    } else if(image.imageableType === 'Spot') {
        const spot = await Spot.findByPk(image.imageableId);
        console.log(spot);
        if(spot.ownerId === req.user.id)
            auth = true;
    }
    if (!auth) {
        res.status(403);
        return res.json({ message: `Forbidden: ${imageableType} is not owned by the current User`});
    }

    await image.destroy();
    return res.json({ message: 'Successfully deleted' });
});

module.exports = router;