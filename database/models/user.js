'use strict'; /* jshint ignore:line */

module.exports = function( sequelize, Sequelize ) {

  var User = sequelize.define( 'User', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      description: 'Table\'s row identifier'
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      description: 'User\'s login email'
    },
    password: {
      type: Sequelize.STRING,
      description: 'User\'s login password'
    },
    full_name: {
      type: Sequelize.STRING,
      description: 'User\'s real full name'
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: '_system_roles',
        key: 'id',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      description: 'User\'s role (reference id)'
    },
    enabled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      description: 'Flag to enable/disable the user on the system'
    },
    last_login_at: {
      type: Sequelize.DATE,
      description: 'User\'s last login timestamp'
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
    tableName: 'users',

    defaultScope: {
      attributes: {
        exclude: ['password', 'created_at', 'updated_at', 'deleted_at']
      }
    },

    classMethods: {
      associate: function( db ) {
        // User.belongsTo( db.SystemRole, { as: 'role' } );
        User.hasMany( db.SystemEndpoint, { as: 'permissions' } );
      },

      addScopes: ( db ) => {
        User.addScope( 'withRole', {
          include: [
            { model: db.SystemRole, as: 'role' }
          ],
          attributes: {
            exclude: ['password', 'created_at', 'updated_at', 'deleted_at']
          }
        });
        User.addScope( 'withPermissions', {
          include: [
            { model: db.SystemEndpoint, as: 'permissions' }
          ],
          attributes: {
            exclude: ['password', 'created_at', 'updated_at', 'deleted_at']
          }
        });
        User.addScope( 'withPassword', {
          attributes: {
            include: ['password'],
            exclude: ['created_at', 'updated_at', 'deleted_at']
          }
        });
      }
    }
  });

  return User;
};
