'use strict';

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( '_system_endpoints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        allowNull: false
      },
      acl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      endpoint: {
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
    return queryInterface.dropTable( '_system_endpoints' );
  }
};
