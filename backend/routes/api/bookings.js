// backend/routes/api/bookings.js
const express = require('express')

const { check } = require('express-validator');
const { requireAuth } = require('../../utils/auth')
const { handleValidationErrors } = require('../../utils/validation');
require('dotenv').config();
require('express-async-errors');

const { Sequelize, User, Booking, Spot, Image } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// GET all Bookings made by the current User
router.get('/current', requireAuth, async (req, res) => {
    const bookings = await Booking.findAll({
        attributes: ['id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
        where: {
            userId: {[Op.eq]: req.user.id}
        }
    }).then(async (result) => {
        const arr = [];
        for await (const booking of result) {
            const json = booking.toJSON();
            const spot = await Spot.findByPk(json.spotId, {
                attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price',
                    [Sequelize.col('url'), 'previewImage']
                ],
                include: {
                    model: Image,
                    as: 'SpotImages',
                    attributes: [],
                    where: { preview: { [Op.eq]: true } }
                }
            });
            const newBooking = {
                id: json.id, spotId: json.spotId,
                Spot: spot,
                userId: json.userId, startDate: json.startDate, endDate: json.endDate, createdAt: json.createdAt, updatedAt: json.updatedAt
            }
            arr.push(newBooking);
        }
        return arr;
    });

    return res.json({ Bookings: bookings });
});

// PUT an existing Booking
router.put('/:bookingId', requireAuth, async (req, res) => {
    const { startDate, endDate } = req.body;

    const booking = await Booking.findByPk(req.params.bookingId);
    if(!booking) {
        res.status(404);
        return res.json({ message: 'Booking couldn\'t be found' });
    }
    if(booking.userId !== req.user.id) {
        res.status(403);
        return res.json({ message: 'Forbidden: Booking is not owned by the current User' });
    }

    booking.set({ startDate, endDate });
    await booking.save();
    return res.json(booking);
});

router.delete('/bookingId', requireAuth, async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId);
    if(!booking) {
        res.status(404);
        return res.json({ message: 'Booking couldn\'t be found' });
    }
    if(booking.userId !== req.user.id) {
        res.status(403);
        return res.json({ message: 'Forbidden: Booking is not owned by the current User' });
    }

    await booking.destroy();
    return res.json({ message: 'Successfully deleted' });
});

module.exports = router;