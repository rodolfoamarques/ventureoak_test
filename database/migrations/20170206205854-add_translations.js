'use strict';

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( 'translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      english_text: {
        type: Sequelize.STRING,
        allowNull: false
      },
      piglatin_text: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: Sequelize.DATE
    });
  },

  down: function( queryInterface, Sequelize ) {
    return queryInterface.dropTable( 'translations' );
  }
};
