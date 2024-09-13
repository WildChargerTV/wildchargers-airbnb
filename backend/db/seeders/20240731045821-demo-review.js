'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        review: 'This was an awesome spot!',
        stars: 5,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      }
    ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    options.truncate = true;
    options.restartIdentity = true;
    return queryInterface.bulkDelete(options, {
      // userId 1 is Demo-lition, a test user 
      userId: { [Sequelize.Op.in]: [1] }
    }, {});
  }
};
