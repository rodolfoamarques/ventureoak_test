'use strict';

module.exports = function( sequelize, Sequelize ) {

  var SystemEndpoint = sequelize.define( 'SystemEndpoint', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      description: 'Table\'s row identifier'
    },
    feature_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: '_system_features',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        description: 'Endpoint\'s feature (reference id)'
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      description: ''
    },
    method: {
      type: Sequelize.STRING,
      allowNull: false,
      description: ''
    },
    acl: {
      type: Sequelize.STRING,
      allowNull: false,
      description: ''
    },
    endpoint: {
      type: Sequelize.STRING,
      allowNull: false,
      description: ''
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
    tableName: '_system_endpoints',

    defaultScope: {
      attributes: {
        exclude: ['acl', 'created_at', 'updated_at', 'deleted_at']
      }
    },

    classMethods: {
      associate: function( db ) {
        SystemEndpoint.belongsToMany( db.User, { as: 'user', through: 'endpoints_users' } );
        // SystemEndpoint.belongsTo( db.SystemFeature, { as: 'feature' } );
      },

      addScopes: function( db ) {
        SystemEndpoint.addScope( 'withACL', {
          attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
          }
        });
      }
    }
  });

  return SystemEndpoint;
};
