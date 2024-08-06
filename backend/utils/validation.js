// backend/utils/validation.js
const { check, validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) { 
        const errors = {};
        validationErrors
        .array()
        .forEach(error => errors[error.path] = error.msg);

        const err = Error("Bad Request");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad Request";
        next(err);
    }
    next();
};

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

const validateSpotParams = [
    check('page')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('Page must be greater than or equal to 1'),
    check('size')
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 20 })
        .withMessage('Size must be between 1 and 20'),
    check('maxLat')
        .optional({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage('Maximum latitude is invalid'),
    check('minLat')
        .optional({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage('Minimum latitude is invalid'),
    check('maxLng')
        .optional({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage('Maximum longitude is invalid'),
    check('minLng')
        .optional({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage('Minimum longitude is invalid'),
    check('maxPrice')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage('Maximum price must be greater than or equal to 0'),
    check('minPrice')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 })
        .withMessage('Minimum price must be greater than or equal to 0'),
    handleValidationErrors
]

// Validate a new Image
const validateImage = [
    check('url')
        .exists({ checkFalsy: true })
        .isURL()
        .withMessage('URL does not exist or is invalid'),
    check('preview')
        .optional({ checkFalsy: true })
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

module.exports = {
    handleValidationErrors,
    validateSpot,
    validateSpotParams,
    validateImage,
    validateReview,
    validateBooking
};