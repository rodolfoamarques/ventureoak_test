'use strict';

var bcrypt = require( 'bcrypt' );

const configs = require( '../../config/configs' );

var newDate = new Date();
var password = bcrypt.hashSync( 'password', configs.saltRounds );


module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.bulkInsert( '_system_features', [
      {
        // 1
        name: 'authentication',
        description: 'authentication feature',
        main_endpoint: '/authentication',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 2
        name: 'roles',
        description: 'roles feature',
        main_endpoint: '/roles',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 3
        name: 'translations',
        description: 'translations feature',
        main_endpoint: '/translations',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 4
        name: 'users',
        description: 'users feature',
        main_endpoint: '/users',
        created_at: newDate,
        updated_at: newDate
      }
    ], {})
    .then( () => queryInterface.bulkInsert( '_system_endpoints', [
      {
        // 1
        feature_id: 1,
        name: 'login',
        method: 'POST',
        acl: false,
        endpoint: '/authentication/login',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 2
        feature_id: 1,
        name: 'register',
        method: 'POST',
        acl: false,
        endpoint: '/authentication/register',
        created_at: newDate,
        updated_at: newDate
      },
      // {
      //   // 3
      //   feature_id: 1,
      //   name: 'recover',
      //   method: 'POST',
      //   acl: false,
      //   endpoint: '/authentication/recover',
      //   created_at: newDate,
      //   updated_at: newDate
      // },
      {
        // 4
        feature_id: 2,
        name: 'create',
        method: 'POST',
        acl: 'system_roles:create',
        endpoint: '/system_roles',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 5
        feature_id: 2,
        name: 'list',
        method: 'GET',
        acl: 'system_roles:readAll',
        endpoint: '/system_roles',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 6
        feature_id: 2,
        name: 'get',
        method: 'GET',
        acl: 'system_roles:readOne',
        endpoint: '/system_roles/{id}',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 7
        feature_id: 2,
        name: 'update',
        method: 'PUT',
        acl: 'system_roles:update',
        endpoint: '/system_roles/{id}',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 8
        feature_id: 2,
        name: 'delete',
        method: 'DELETE',
        acl: 'system_roles:destroy',
        endpoint: '/system_roles/{id}',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 9
        feature_id: 3,
        name: 'create',
        method: 'POST',
        acl: 'translations:create',
        endpoint: '/translations',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 10
        feature_id: 3,
        name: 'list',
        method: 'GET',
        acl: 'translations:readAll',
        endpoint: '/translations',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 11
        feature_id: 3,
        name: 'get',
        method: 'GET',
        acl: 'translations:readOne',
        endpoint: '/translations/{id}',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 12
        feature_id: 4,
        name: 'create',
        method: 'POST',
        acl: 'users:create',
        endpoint: '/users',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 13
        feature_id: 4,
        name: 'list',
        method: 'GET',
        acl: 'users:readAll',
        endpoint: '/users',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 14
        feature_id: 4,
        name: 'get',
        method: 'GET',
        acl: 'users:readOne',
        endpoint: '/users/{id}',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 15
        feature_id: 4,
        name: 'update',
        method: 'PUT',
        acl: 'users:update',
        endpoint: '/users/{id}',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 16
        feature_id: 4,
        name: 'delete',
        method: 'DELETE',
        acl: 'users:destroy',
        endpoint: '/users/{id}',
        created_at: newDate,
        updated_at: newDate
      }
    ], {}) )
    .then( () => queryInterface.bulkInsert( '_system_roles', [
      {
        // 1
        name: 'root',
        description: 'root role',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 2
        name: 'super_admin',
        description: 'super_admin role',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 3
        name: 'admin',
        description: 'admin role',
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 4
        name: 'user',
        description: 'user role',
        created_at: newDate,
        updated_at: newDate
      }
    ], {}) )
    .then( () => queryInterface.bulkInsert( 'users', [
      {
        // 1
        email: 'demo1@mail.com',
        password: password,
        full_name: 'Demo User 1',
        role_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 2
        email: 'demo2@mail.com',
        password: password,
        full_name: 'Demo User 2',
        role_id: 2,
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 3
        email: 'demo3@mail.com',
        password: password,
        full_name: 'Demo User 3',
        role_id: 3,
        created_at: newDate,
        updated_at: newDate
      },
      {
        // 4
        email: 'demo4@mail.com',
        password: password,
        full_name: 'Demo User 4',
        role_id: 4,
        created_at: newDate,
        updated_at: newDate
      }
    ], {}) )
    .then( () => queryInterface.bulkInsert( 'endpoints_users', [
      {
        endpoint_id: 1,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 2,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 3,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 4,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 5,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 6,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 7,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 8,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 9,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 10,
        user_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        endpoint_id: 5,
        user_id: 2,
        created_at: newDate,
        updated_at: newDate
      },
    ], {}) )
    .then( () => queryInterface.bulkInsert( 'features_roles', [
      {
        feature_id: 1,
        role_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 2,
        role_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 3,
        role_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 4,
        role_id: 1,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 1,
        role_id: 2,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 2,
        role_id: 2,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 3,
        role_id: 3,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 4,
        role_id: 3,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 2,
        role_id: 4,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 3,
        role_id: 4,
        created_at: newDate,
        updated_at: newDate
      },
      {
        feature_id: 4,
        role_id: 4,
        created_at: newDate,
        updated_at: newDate
      },
    ], {}) );
  },

  down: function( queryInterface, Sequelize ) {
    return queryInterface.bulkDelete( 'endpoints_users', null, {} )
      .then( () => queryInterface.bulkDelete( 'users', null, {} ) )
      .then( () => queryInterface.sequelize.query('ALTER SEQUENCE users_id_seq RESTART WITH 1') )
      .then( () => queryInterface.bulkDelete( '_system_endpoints', null, {} ) )
      .then( () => queryInterface.sequelize.query('ALTER SEQUENCE _system_endpoints_id_seq RESTART WITH 1') )
      .then( () => queryInterface.bulkDelete( 'features_roles', null, {} ) )
      .then( () => queryInterface.bulkDelete( '_system_roles', null, {} ) )
      .then( () => queryInterface.sequelize.query('ALTER SEQUENCE _system_roles_id_seq RESTART WITH 1') )
      .then( () => queryInterface.bulkDelete( '_system_features', null, {} ) )
      .then( () => queryInterface.sequelize.query('ALTER SEQUENCE _system_features_id_seq RESTART WITH 1') );
  }
};
