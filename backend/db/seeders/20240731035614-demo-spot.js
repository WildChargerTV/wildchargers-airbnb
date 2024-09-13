'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: '123 Disney Lane',
        city: 'San Francisco',
        state: 'California',
        country: 'United States of America',
        lat: 37.7645358,
        lng: -122.4730327,
        name: 'App Academy',
        description: 'Place where web developers are created.',
        price: 123,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      },
      {
        ownerId: 1,
        address: '246 Campfire Court',
        city: 'Elizabeth City',
        state: 'North Carolina',
        country: 'United States of America',
        lat: 10.19837,
        lng: -35.75237,
        name: 'The Eastern Seaboard',
        description: 'Cozy cabin in a forest not too far from the coastline.',
        price: 242,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      },
      {
        ownerId: 2,
        address: '772 Greenrose Avenue',
        city: 'Manchester',
        state: 'New Hampshire',
        country: 'United States of America',
        lat: 29.44082,
        lng: -175.76760,
        name: 'British Penthouse',
        description: 'A posh brick condominium in the older part of town, perfect for posh living.',
        price: 909,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      },
      {
        ownerId: 3,
        address: '9220 West Lake Road',
        city: 'Clifton Park',
        state: 'New York',
        country: 'United States of America',
        lat: 25.95150,
        lng: -11.88130,
        name: 'Proximity on a Budget',
        description: 'Small house, not suitable for long-term living, but suitable as a hotel room to use when visiting the nearby theme park.',
        price: 97,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      },
      {
        ownerId: 4,
        address: '8011 Talbot Avenue',
        city: 'Kearny',
        state: 'New Jersey',
        country: 'United States of America',
        lat: -6.62911,
        lng: -43.32437,
        name: 'Downtown Apartment Space',
        description: '1 bed, 2 bath apartment with easy access to most of the downtown district. And not pathetically small, like the apartments in New York.',
        price: 1299,
        createdAt: '2021-11-19 20:39:36',
        updatedAt: '2021-11-19 20:39:36'
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    options.truncate = true;
    options.restartIdentity = true;
    return queryInterface.bulkDelete(options, {
      address: { [Sequelize.Op.in]: ['123 Disney Lane'] }
    }, {});
  }
};
