'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.hasMany(models.Image, { 
        foreignKey: 'imageableId',
        constraints: false,
        scope: {
          imageableType: 'Review'
        },
        as: 'ReviewImages'
      });

      Review.belongsTo(models.Spot, { 
        foreignKey: 'spotId' 
      });

      Review.belongsTo(models.User, { 
        foreignKey: 'userId' 
      });
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    review: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 512]
      }
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};