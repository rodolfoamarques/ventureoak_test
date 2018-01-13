'use strict';

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( '_system_features', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      main_endpoint: {
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
    return queryInterface.dropTable( '_system_features' );
  }
};
