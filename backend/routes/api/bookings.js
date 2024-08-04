// backend/routes/api/bookings.js
const express = require('express')

const { requireAuthentication, requireAuthorization } = require('../../utils/auth');
const { findInstance } = require('../../utils/search');
require('dotenv').config();
require('express-async-errors');

const { Sequelize, Booking, Spot, Image } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// GET all Bookings made by the current User
router.get('/current', requireAuthentication, async (req, res) => {
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
router.put('/:bookingId', requireAuthentication, (req, _res, next) => {
    req.body.type = 'Booking';
    req.body.Model = Booking;
    req.body.param = req.params.bookingId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, async (req, res) => {
    const booking = req.body.instance;
    const { startDate, endDate } = req.body;

    booking.set({ startDate, endDate });
    await booking.save();
    return res.json(booking);
});

router.delete('/bookingId', requireAuthentication, async (req, _res, next) => {
    req.body.type = 'Booking';
    req.body.Model = Booking;
    req.body.param = req.params.bookingId;
    req.body.options = {};
    return next();
}, findInstance, requireAuthorization, async (req, res) => {
    const booking = req.body.instance;

    await booking.destroy();
    return res.json({ message: 'Successfully deleted' });
});

module.exports = router;