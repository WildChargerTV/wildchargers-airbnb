'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.hasMany(models.Booking, { 
        foreignKey: 'spotId', 
        sourceKey: 'id',
        onDelete: 'CASCADE', 
        hooks: true 
      });

      Spot.hasMany(models.Image, { 
        foreignKey: 'imageableId',
        sourceKey: 'id',
        constraints: false,
        scope: {
          imageableType: 'Spot'
        },
        as: 'SpotImages'
      });
      
      Spot.hasMany(models.Review, {
        foreignKey: 'spotId', 
        sourceKey: 'id',
        onDelete: 'CASCADE', 
        hooks: true
      });

      Spot.belongsTo(models.User, { 
        foreignKey: 'ownerId',
        targetKey: 'id',
        as: 'Owner'
      });
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true
      }
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};