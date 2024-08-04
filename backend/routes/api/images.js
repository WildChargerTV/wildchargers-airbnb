// backend/routes/api/bookings.js
const express = require('express')

const { requireAuthentication } = require('../../utils/auth');
const { findInstance } = require('../../utils/search');
require('dotenv').config();
require('express-async-errors');

const { Image, Review, Spot } = require('../../db/models');

const router = express.Router();

// DELETE an existing Image from a Review or a Spot
router.delete('/:imageId', requireAuthentication, async (req, _res, next) => {
    req.body.type = 'Image';
    req.body.Model = Image;
    req.body.param = req.params.imageId;
    req.body.options = { attributes: ['id', 'url', 'imageableType', 'imageableId', 'preview'] };
    return next();
}, findInstance, async (req, res) => {
    const image = req.body.instance;

    // Takes the url and derives the intended imageableType from it, in the absence of an image to reference
    let imageableType = req.baseUrl.split('/')[2].split('-')[0];
    imageableType = imageableType[0].toUpperCase() + imageableType.slice(1);
    
    // This is an authorization checker, but will not be integrated into requireAuthorization due to its unique usage
    let auth = false;
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