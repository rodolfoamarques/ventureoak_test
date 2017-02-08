'use strict'; /* jshint ignore:line */

module.exports = function( sequelize, Sequelize ) {

  var Translation = sequelize.define( 'Translation', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      description: 'Table\'s row identifier'
    },
    english_text: {
      type: Sequelize.STRING,
      allowNull: false,
      description: 'Original text in english language'
    },
    piglatin_text: {
      type: Sequelize.STRING,
      allowNull: false,
      description: 'Translated text in Pig Latin'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      description: 'Row created on'
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      description: 'Row updated on'
    },
    deleted_at: {
      type: Sequelize.DATE,
      description: 'Row deleted on'
    }

  }, {
    tableName: 'translations',

    defaultScope: {
      attributes: {
        exclude: ['created_at', 'updated_at', 'deleted_at']
      }
    }
  });

  return Translation;
};
