'use strict'; /* jshint ignore:line */

var newDate = new Date();


module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.bulkInsert( '_system_roles', [
      {
        // 1
        name: 'super_admin',
        permissions: '{ "users": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }',
        created_at: newDate,
        updated_at: newDate
      }, {
        // 2
        name: 'admin',
        permissions: '{ "users": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }',
        created_at: newDate,
        updated_at: newDate
      }, {
        // 3
        name: 'user',
        permissions: '{ "users": { "create": false, "readAll": true, "readOne": true, "update": false, "destroy": true } }',
        created_at: newDate,
        updated_at: newDate
      }
    ], {});
  },

  down: function( queryInterface, Sequelize ) {
    return queryInterface.bulkDelete( '_system_roles', null, {} );
  }
};
