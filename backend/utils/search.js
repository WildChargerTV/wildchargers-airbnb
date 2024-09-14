// backend/utils/search.js

// Verify the existence of a Spot, if the URL has a spotId
const findInstance = async (req, res, next) => {
    const { type, Model, param, options } = req.body;
    console.log(req.body);
    const target = await Model.findByPk(param, options);
    console.log(target);

    if(!target?.toJSON()?.id) { // TODO oddity: some custom columns can cause an object with all null values to be returned rather than no object. Can this be avoided?
        res.status(404);
        return res.json({ message: `${type} couldn't be found` });
    } else {
        req.body.instance = target;
        return next();
    }
}

module.exports = { findInstance };