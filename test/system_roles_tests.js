'use strict'; /* jshint ignore:line */

var Lab = require( 'lab' );
var code = require( 'code' );
var moment = require( 'moment' );

var db = require( '../database/models' );

const lab = exports.lab = Lab.script();
const server = require( '../' ).select( 'api' );
const baseRoute = '/system_roles';


lab.experiment( 'Roles Endpoint', function() {

  var way_over_highest_role_id;
  var sample_role = {
    name: 'sample_role',
    permissions: '{ "some_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }'
  };
  var updated_role = {
    name: 'updated_role',
    permissions: '{ "other_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }'
  };


  // Run before the first test
  lab.before( done => {

    db.SystemRole.count()
    .then( reply => {
      way_over_highest_role_id = reply*999+9999;
      done();
    });

  });


  // Run before every single test
  lab.beforeEach( done => { done(); } );


  // Run after the every single test
  lab.afterEach( done => { done(); } );


  // Run after the last test
  lab.after( done => { done(); });


  // Test scenario to get all roles in the database
  lab.test( 'GET all roles', function( done ) {

    // get all roles from database
    db.SystemRole.scope(['withPermissions']).findAll()
    .then( roles => {

      var options = {
        method: 'GET',
        url: baseRoute
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        // Expect result length to be equal to the database reply length
        code.expect( result.length ).to.be.equal( roles.length );

        for( var i=0; i<result.length; i++ ) {
          var role = roles[i].toJSON();
          var res = result[i].toJSON();

          // Expect each role in result to be equal to each role in the database reply
          code.expect( res ).to.be.equal( role );
        }

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to get a specific role from the database
  lab.test( 'GET specific role', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( created_role => {

      db.SystemRole.scope([ 'withPermissions' ]).findById( created_role.id )
      .then( role => {

        var options = {
          method: 'GET',
          url: baseRoute + '/' + created_role.id
        }

        // server.inject allows a simulation of an http request
        server.inject( options, function( response ) {
          var result = response.result.toJSON();

          // Expect http response status code to be 200 ("Ok")
          code.expect( response.statusCode ).to.be.equal( 200 );
          // Expect result to be equal to database reply
          code.expect( result ).to.be.equal( role.toJSON() );

          // destroy the test role
          created_role.destroy();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to get an role that does not exist in the database
  lab.test( 'GET non-existing role', function( done ) {

    var options = {
      method: 'GET',
      url: baseRoute + '/' + way_over_highest_role_id
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 404 ("Not Found")
      code.expect( response.statusCode ).to.be.equal( 404 );
      code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get an entry with a negative id from the database
  lab.test( 'GET negative ID role', function( done ) {

    var options = {
      method: 'GET',
      url: baseRoute + '/-1'
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role', function( done ) {

    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result.toJSON();
      delete result.created_at;
      delete result.updated_at;
      delete result.deleted_at;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // get created role from database
      db.SystemRole.scope([ 'withPermissions' ]).findById( result.id )
      .then( role => {

        // Expect database reply to be equal to result
        code.expect( role.toJSON() ).to.be.equal( result );

        // destroy the role created with POST
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new role in the database with forbidden keys
  lab.test( 'POST new role with forbidden keys - part 1 (forbidden: created_at)', function( done ) {

    sample_role.created_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_role.created_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with forbidden keys
  lab.test( 'POST new role with forbidden keys - part 2 (forbidden: updated_at)', function( done ) {

    sample_role.updated_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_role.updated_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with forbidden keys
  lab.test( 'POST new role with forbidden keys - part 3 (forbidden: deleted_at)', function( done ) {

    sample_role.deleted_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_role.deleted_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with inexistent keys in the model
  lab.test( 'POST new role with extra information (extra: non_existing_key)', function( done ) {

    sample_role.non_existing_key = 'dummy value';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_role.non_existing_key;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with required parameters missing
  lab.test( 'POST new role with missing data - part 1 (name missing)', function( done ) {

    delete sample_role.name;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_role.name = 'sample_role';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with required parameters missing
  lab.test( 'POST new role with missing data - part 2 (permissions missing)', function( done ) {

    delete sample_role.permissions;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_role.permissions = '{ "some_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with invalid values
  lab.test( 'POST new role with invalid data - part 1.0 (name must be a string)', function( done ) {

    sample_role.name = true;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_role.name = 'sample_role';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database with invalid values
  lab.test( 'POST new role with invalid data - part 1.1 (name must be a unique)', function( done ) {

    sample_role.name = 'user';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_role.name = 'sample_role';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });

/*
  // Test scenario to create a new role in the database with invalid values
  lab.test( 'POST new role with invalid data - part 2 (permissions must be a valid json object)', function( done ) {

    sample_role.permissions = '';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_role.permissions = '{ "some_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });
*/

  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result.toJSON();
        delete result.created_at;
        delete result.updated_at;
        delete result.deleted_at;

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        // get updated role from database
        db.SystemRole.scope([ 'withPermissions' ]).findById( result.id )
        .then( u_role => {

          // Expect database reply to be equal to result
          code.expect( u_role.toJSON() ).to.be.equal( result );

          // destroy the test role
          u_role.destroy();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to create a new role in the database with forbidden keys
  lab.test( 'PUT to existing role with forbidden keys - part 1 (forbidden: created_at)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.created_at = moment();
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        delete updated_role.created_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new role in the database with forbidden keys
  lab.test( 'PUT to existing role with forbidden keys - part 2 (forbidden: updated_at)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.updated_at = moment();
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        delete updated_role.updated_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new role in the database with forbidden keys
  lab.test( 'PUT to existing role with forbidden keys - part 3 (forbidden: deleted_at)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.deleted_at = moment();
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        delete updated_role.deleted_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new role in the database with inexistent keys in the model
  lab.test( 'PUT to existing role with extra information (extra: non_existing_key)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.non_existing_key = 'dummy value';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        delete updated_role.non_existing_key;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new role in the database with invalid values
  lab.test( 'PUT to existing role with invalid data - part 1.0 (name must be a string)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.name = 10;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        updated_role.name = 'updated_role';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new role in the database with invalid values
  lab.test( 'PUT to existing role with invalid data - part 1.1 (name must be unique)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.name = 'admin';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        updated_role.email = 'updated_role';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });

/*
  // Test scenario to create a new role in the database with invalid values
  lab.test( 'PUT to existing role with invalid data - part 2 (permissions must be a valid json object)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.permissions = '';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test role
        role.destroy();

        updated_role.permissions = '{ "some_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });
*/

  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role', function( done ) {

    db.SystemRole.create( sample_role )
    .then( role => {

      var options = {
        method: 'DELETE',
        url: baseRoute + '/' + role.id
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        // try to get deleted role from database
        db.SystemRole.findById( role.id )
        .then( del_role => {
          // Expect database reply to be undefined
          code.expect( del_role ).to.not.exist();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to delete an role that does not exist in the database
  lab.test( 'DELETE non-existing role', function( done ) {

    var options = {
      method: 'DELETE',
      url: baseRoute + '/' + way_over_highest_role_id
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 404 ("Not Found")
      code.expect( response.statusCode ).to.be.equal( 404 );
      code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to delete an entry with a negative id from the database
  lab.test( 'DELETE negative ID role', function( done ) {

    var options = {
      method: 'DELETE',
      url: baseRoute + '/-1'
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });

});
