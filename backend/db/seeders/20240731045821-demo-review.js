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
        userId: 2,
        spotId: 1,
        review: 'This was an awesome spot!',
        stars: 5,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      },
      {
        userId: 3,
        spotId: 1,
        review: `It's alright. Certainly livable, but you can probably find better nearby.`,
        stars: 3,
        createdAt: '2023-05-05 12:21:19',
        updatedAt: '2023-05-05 12:21:19'
      },
      {
        userId: 4,
        spotId: 1,
        review: `It's got a lot of upsides, but the insulation might be too good. All you gotta do is talk for like, an hour, and then the entire house can just become eerily silent later.`,
        stars: 3,
        createdAt: '2017-01-02 15:13:17',
        updatedAt: '2017-01-02 15:13:17'
      },
      {
        userId: 1,
        spotId: 3,
        review: `How the hell did this place get constructed? There's not even a kitchen! I shouldn't have to order Uber Eats every time I get back from the theme park!`,
        stars: 1,
        createdAt: '2021-07-26 00:23:23',
        updatedAt: '2021-07-26 00:23:23'
      }
    ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    options.truncate = true;
    options.restartIdentity = true;
    return queryInterface.bulkDelete(options, {
      // userId 1 is Demo-lition, a test user 
      userId: { [Sequelize.Op.in]: [1, 2, 3, 4] }
    }, {});
  }
};
