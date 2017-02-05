'use strict'; /* jshint ignore:line */

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( '_system_roles', {
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
      permissions: {
        type: Sequelize.JSONB,
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
    return queryInterface.dropTable( '_system_roles' );
  }
};
