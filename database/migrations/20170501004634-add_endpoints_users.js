'use strict';

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( 'endpoints_users', {
      endpoint_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: '_system_endpoints',
            key: 'id',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }
      },
      user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }
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
    return queryInterface.dropTable( 'endpoints_users' );
  }
};
