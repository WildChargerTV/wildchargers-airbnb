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
      imageableType: 'Spot',
      imageableId: 2,
      preview: true
    },
    {
      url: 'https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg',
      imageableType: 'Spot',
      imageableId: 3,
      preview: true
    },
    {
      url: 'https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg',
      imageableType: 'Spot',
      imageableId: 4,
      preview: true
    },
    {
      url: 'https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg',
      imageableType: 'Spot',
      imageableId: 5,
      preview: true
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
    options.truncate = true;
    options.restartIdentity = true;
    return queryInterface.bulkDelete(options, {
      url: { [Sequelize.Op.in]: ['https://i.kym-cdn.com/photos/images/original/001/042/619/4ea.jpg'] }
    }, {});
  }
};
