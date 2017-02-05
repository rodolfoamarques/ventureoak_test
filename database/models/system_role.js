'use strict'; /* jshint ignore:line */

module.exports = function( sequelize, Sequelize ) {

  var SystemRole = sequelize.define( 'SystemRole', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      description: 'Table\'s row identifier'
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      description: 'Name of the role'
    },
    permissions: {
      type: Sequelize.JSONB,
      allowNull: false,
      description: 'Set of permissions for this role'
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
    tableName: '_system_roles',

    defaultScope: {
      attributes: {
        exclude: ['permissions', 'created_at', 'updated_at', 'deleted_at']
      }
    },

    classMethods: {
      associate: function( db ) {
        // SystemRole.hasMany( db.User, { as: 'users' } );
      },

      addScopes: function( db ) {
        SystemRole.addScope( 'withPermissions', {
          attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
          }
        });
      }
    }
  });

  return SystemRole;
};
