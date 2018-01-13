'use strict';

module.exports = function( sequelize, Sequelize ) {

  var SystemFeature = sequelize.define( 'SystemFeature', {
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
      description: 'Name of the feature'
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      description: 'Description of the feature'
    },
    main_endpoint: {
      type: Sequelize.STRING,
      allowNull: false,
      description: 'Main endpoint for the feature'
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
    tableName: '_system_features',

    defaultScope: {
      attributes: {
        exclude: ['created_at', 'updated_at', 'deleted_at']
      }
    },

    classMethods: {
      associate: function( db ) {
        SystemFeature.belongsToMany( db.SystemRole, { as: 'role', through: 'features_roles' } );
        SystemFeature.hasMany( db.SystemEndpoint, { as: 'endpoints' } );
      }
    },

    addScopes: ( db ) => {
      User.addScope( 'withEndpoints', {
        include: [
          { model: db.SystemEndpoint, as: 'endpoints' }
        ],
        attributes: {
          exclude: ['created_at', 'updated_at', 'deleted_at']
        }
      });
    }
  });

  return SystemFeature;
};
