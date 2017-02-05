'use strict'; /* jshint ignore:line */

var newDate = new Date();


module.exports = {
  up: function( queryInterface, Sequelize ) {
    return queryInterface.bulkInsert( '_system_roles', [
      {
        // 1
        name: 'super_admin',
        permissions: '{ "system_roles": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true }, "users": { "create": false, "readAll": false, "readOne": false, "update": false, "destroy": false } }',
        created_at: newDate,
        updated_at: newDate
      }, {
        // 2
        name: 'admin',
        permissions: '{ "system_roles": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true }, "users": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }',
        created_at: newDate,
        updated_at: newDate
      }, {
        // 3
        name: 'user',
        permissions: '{ "system_roles": { "create": false, "readAll": false, "readOne": false, "update": false, "destroy": false }, "users": { "create": false, "readAll": true, "readOne": true, "update": false, "destroy": true } }',
        created_at: newDate,
        updated_at: newDate
      }
    ], {});
  },

  down: function( queryInterface, Sequelize ) {
    return queryInterface.bulkDelete( '_system_roles', null, {} );
  }
};
