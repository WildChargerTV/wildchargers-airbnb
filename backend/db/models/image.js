'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    getImageable(options) {
      if(!this.imageableType)
        return Promise.resolve(null);

      const mixinMethodName = `get${this.imageableType}`;
      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(models.Review, { 
        foreignKey: 'imageableId',
        constraints: false,
        as: 'ReviewImages'
      });
      Image.belongsTo(models.Spot, { 
        foreignKey: 'imageableId',
        constraints: false
      });
    }
  }

  Image.init({
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    imageableType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Spot', 'Review']]
      }
    },
    imageableId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Image',
    defaultScope: {
      attributes: {
        exclude: ['imageableType', 'imageableId', 'createdAt', 'updatedAt']
      }
    }
  });
  return Image;
};