'use strict'; /* jshint ignore:line */

var bcrypt = require( 'bcrypt' );
var moment = require( 'moment' );

var newDate = new Date();
var password = bcrypt.hashSync( 'password', bcrypt.genSaltSync(10) );


module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.bulkInsert( '_system_roles', [
      {
        // 1
        name: 'super_admin',
        permissions: '{ "system_roles": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true }, "users": { "create": false, "readAll": false, "readOne": false, "update": false, "destroy": false }, "translations": { "create": true, "readAll": true, "readOne": true } }',
        created_at: newDate,
        updated_at: newDate
      }, {
        // 2
        name: 'admin',
        permissions: '{ "system_roles": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true }, "users": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true }, "translations": { "create": true, "readAll": true, "readOne": true } }',
        created_at: newDate,
        updated_at: newDate
      }, {
        // 3
        name: 'user',
        permissions: '{ "system_roles": { "create": false, "readAll": false, "readOne": false, "update": false, "destroy": false }, "users": { "create": false, "readAll": false, "readOne": true, "update": false, "destroy": true }, "translations": { "create": false, "readAll": false, "readOne": false } }',
        created_at: newDate,
        updated_at: newDate
      }
    ], {})
    .then( () => queryInterface.bulkInsert( 'users', [
      {
        // 1
        email: 'demo1@mail.com',
        password: password,
        full_name: 'Demo User 1',
        role_id: 1,
        created_at: newDate,
        updated_at: newDate
      }, {
        // 2
        email: 'demo2@mail.com',
        password: password,
        full_name: 'Demo User 2',
        role_id: 2,
        created_at: newDate,
        updated_at: newDate
      }, {
        // 3
        email: 'demo3@mail.com',
        password: password,
        full_name: 'Demo User 3',
        role_id: 3,
        created_at: newDate,
        updated_at: newDate
      }
    ], {}) );
  },

  down: function( queryInterface, Sequelize ) {
    return queryInterface.bulkDelete( 'users', null, {} )
      .then( () => queryInterface.sequelize.query('ALTER SEQUENCE users_id_seq RESTART WITH 1') )
      .then( () => queryInterface.bulkDelete( '_system_roles', null, {} ) );
  }
};
