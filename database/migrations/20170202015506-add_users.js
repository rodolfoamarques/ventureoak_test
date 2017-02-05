'use strict'; /* jshint ignore:line */

module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.createTable( 'users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: Sequelize.STRING,
      full_name: Sequelize.STRING,
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
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login_at: Sequelize.DATE,
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
    return queryInterface.dropTable( 'users' );
  }
};
