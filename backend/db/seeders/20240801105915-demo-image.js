'use strict';

const { Image } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await Image.bulkCreate([
    {
      url: 'https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg',
      imageableType: 'Spot',
      imageableId: 1,
      preview: true
    },
    {
      url: 'https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg',
      imageableType: 'Spot',
      imageableId: 1,
      preview: false
    },
    {
      url: 'https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg',
      imageableType: 'Review',
      imageableId: 1,
      preview: true
    }
   ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Images';
    return queryInterface.bulkDelete(options, {
      // userId 2 is FakeUser1, a test user
      url: { [Sequelize.Op.eq]: ['https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg'] }
    }, {});
  }
};
