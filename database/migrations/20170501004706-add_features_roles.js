'use strict';

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( 'features_roles', {
      feature_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: '_system_features',
            key: 'id',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }
      },
      role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: '_system_roles',
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
    return queryInterface.dropTable( 'features_roles' );
  }
};
