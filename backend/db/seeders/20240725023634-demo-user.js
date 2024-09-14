'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'Tavish',
        lastName: 'DeGroot'
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: 'Fake',
        lastName: 'User'
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: 'Faker',
        lastName: 'User'
      },
      {
        email: 'yahoo@gmail.com',
        username: 'LivingMeme',
        hashedPassword: bcrypt.hashSync('trolled'),
        firstName: 'Damian',
        lastName: 'Flynn'
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    options.truncate = true;
    options.restartIdentity = true;
    return queryInterface.bulkDelete(options, {
      username: { [Sequelize.Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2', 'LivingMeme'] }
    }, {});
  }
};
