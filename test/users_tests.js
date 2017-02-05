'use strict'; /* jshint ignore:line */

var Lab = require( 'lab' );
var code = require( 'code' );
var bcrypt = require( 'bcrypt' );
var moment = require( 'moment' );

var db = require( '../database/models' );

const lab = exports.lab = Lab.script();
const server = require( '../' ).select( 'api' );
const baseRoute = '/users';


lab.experiment( 'Users Endpoint', function() {

  var way_over_highest_user_id;
  var sample_user = {
    email: 'sample@mail.com',
    password: 'password',
    password_confirmation: 'password',
    full_name: 'Sample User',
    role_id: 3
  };
  var updated_user = {
    email: 'updated_sample@mail.com',
    password: 'other_password',
    password_confirmation: 'other_password',
    full_name: 'Updated User',
    role_id: 2
  };


  // Run before the first test
  lab.before( done => {

    db.User.count()
    .then( reply => {
      way_over_highest_user_id = reply*999+9999;
      done();
    });

  });


  // Run before every single test
  lab.beforeEach( done => { done(); } );


  // Run after the every single test
  lab.afterEach( done => { done(); } );


  // Run after the last test
  lab.after( done => { done(); });


  // Test scenario to get all users in the database
  lab.test( 'GET all users', function( done ) {

    var options = {
      method: 'GET',
      url: baseRoute
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // get all users from database
      db.User.scope(['withRole']).findAll()
      .then( users => {
        // Expect result length to be equal to the database reply length
        code.expect( result.length ).to.be.equal( users.length );

        for( var i=0; i<result.length; i++ ) {
          var user = users[i].toJSON();
          var res = result[i].toJSON();

          // Expect each user in result to be equal to each user in the database reply
          code.expect( res ).to.be.equal( user );
        }

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to get a specific user from the database
  lab.test( 'GET specific user', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( created_user => {
      created_user = created_user.toJSON();
      delete created_user.password;
      delete created_user.created_at;
      delete created_user.updated_at;
      delete created_user.deleted_at;

      var options = {
        method: 'GET',
        url: baseRoute + '/' + created_user.id
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result.toJSON();

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        db.User.scope([ 'withRole' ]).findById( result.id )
        .then( user => {

          // Expect result to be equal to database reply
          code.expect( result ).to.be.equal( user.toJSON() );

          // destroy the test user
          user.destroy();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to get an user that does not exist in the database
  lab.test( 'GET non-existing user', function( done ) {

    var options = {
      method: 'GET',
      url: baseRoute + '/' + way_over_highest_user_id
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
  lab.test( 'GET negative ID user', function( done ) {

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


  // Test scenario to create a new user in the database
  lab.test( 'POST new user', function( done ) {

    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;
      delete result.created_at;
      delete result.updated_at;
      delete result.deleted_at;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // get created user from database
      db.User.findById( result.id )
      .then( user => {
        // Expect database reply to be equal to result
        code.expect( user.toJSON() ).to.be.equal( result );

        // destroy the user created with POST
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 1 (forbidden: id)', function( done ) {

    sample_user.id = 10;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.id;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 2 (forbidden: enabled)', function( done ) {

    sample_user.enabled = false;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.enabled;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 3 (forbidden: last_login_at)', function( done ) {

    sample_user.last_login_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.last_login_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 2 (forbidden: created_at)', function( done ) {

    sample_user.created_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.created_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 3 (forbidden: updated_at)', function( done ) {

    sample_user.updated_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.updated_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 4 (forbidden: deleted_at)', function( done ) {

    sample_user.deleted_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.deleted_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with inexistent keys in the model
  lab.test( 'POST new user with extra information (extra: non_existing_key)', function( done ) {

    sample_user.non_existing_key = 'dummy value';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.non_existing_key;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 1 (email missing)', function( done ) {

    delete sample_user.email;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 2 (role_id missing)', function( done ) {

    delete sample_user.role_id;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 3 (password missing)', function( done ) {

    delete sample_user.password_confirmation;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password_confirmation = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 4 (password_confirmation missing)', function( done ) {

    delete sample_user.password;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.0 (email must be a valid email address)', function( done ) {

    sample_user.email = 10;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.1 (email must be a valid email address)', function( done ) {

    sample_user.email = 'invalid_email';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.2 (email must be a valid email address)', function( done ) {

    sample_user.email = 'invalid@email';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.3 (email must be a valid email address)', function( done ) {

    sample_user.email = 'invalid@.com';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.4 (email must be a valid email address)', function( done ) {

    sample_user.email = '@mail.com';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.5 (email must be unique)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      // attempt to POST a new user with the same email as the test user
      updated_user.email = sample_user.email;
      var options = {
        method: 'POST',
        url: baseRoute,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'updated_sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 2.0 (role_id must be an integer larger than or equal to 1)', function( done ) {

    sample_user.role_id = 'not a number';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 2.1 (role_id must be an integer larger than or equal to 1)', function( done ) {

    sample_user.role_id = 0;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 2.2 (role_id must be an integer larger than or equal to 1)', function( done ) {

    sample_user.role_id = -123;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 2.3 (role_id must be an integer larger than or equal to 1)', function( done ) {

    sample_user.role_id = 1.1241;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 3 (full_name must be a string)', function( done ) {

    sample_user.full_name = true;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.full_name = 'Sample User';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 4.0 (password_confirmation must be a string)', function( done ) {

    sample_user.password_confirmation = 1234;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password_confirmation = 'other_password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 4.1 (password must be a string)', function( done ) {

    sample_user.password = 1234;
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password = 'other_password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 4.2 (password must be equal to password_confirmation)', function( done ) {

    sample_user.password = 'not_password';
    var options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password = 'other_password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result.toJSON();
        delete result.password;
        delete result.created_at;
        delete result.updated_at;
        delete result.deleted_at;

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        // get updated user from database
        db.User.findById( result.id )
        .then( u_user => {
          // Expect database reply to be equal to result
          code.expect( u_user.toJSON() ).to.be.equal( result );

          // destroy the test user
          u_user.destroy();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'PUT to existing user with forbidden keys - part 1 (forbidden: id)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.id = 10;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        delete updated_user.id;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'PUT to existing user with forbidden keys - part 2 (forbidden: created_at)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.created_at = moment();
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        delete updated_user.created_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'PUT to existing user with forbidden keys - part 3 (forbidden: updated_at)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {
      updated_user.updated_at = moment();

      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        delete updated_user.updated_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'PUT to existing user with forbidden keys - part 3 (forbidden: updated_at)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {
      updated_user.deleted_at = moment();

      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        delete updated_user.deleted_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with inexistent keys in the model
  lab.test( 'PUT to existing user with extra information (extra: non_existing_key)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.non_existing_key = 'dummy value';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        delete updated_user.non_existing_key;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.0 (email must be a valid email address)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 10;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.1 (email must be a valid email address)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid_email';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.2 (email must be a valid email address)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid@email';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.2 (email must be a valid email address)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid@email';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.3 (email must be a valid email address)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid@.com';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.4 (email must be a valid email address)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = '@mail.com';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.email = 'sample@mail.com';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 1.5 (email must be unique)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    // create a second test user
    .then( () => db.User.create(updated_user) )
    .then( user => {

      // change the email of the second test user to match the first
      updated_user.email = sample_user.email;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // try to PUT the information
      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        updated_user.email = 'sample@mail.com';

        // destroy the second test user
        user.destroy()
        // destroy the first test user
        .then( () => db.User.destroy( { where: { email: sample_user.email } } ) )
        .then( () => {
          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 2.0 (role_id must be an integer larger than or equal to 1)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 'not a number';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.role_id = 3;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 2.1 (role_id must be an integer larger than or equal to 1)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 0;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.role_id = 3;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 2.2 (role_id must be an integer larger than or equal to 1)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = -123;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.role_id = 3;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 2.3 (role_id must be an integer larger than or equal to 1)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 1.1241;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.role_id = 3;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 3 (full_name must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.full_name = true;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.full_name = 'Updated User';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 4.0 (password_confirmation must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.password_confirmation = 1234;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.password_confirmation = 'other_password';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 4.1 (password must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.password = 1234;
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.password = 'other_password';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'PUT to existing user with invalid data - part 4.2 (password must be equal to password_confirmation)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.password = 'not_password';
      var options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 400 ("Bad Request")
        code.expect( response.statusCode ).to.be.equal( 400 );
        code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

        // destroy the test user
        user.destroy();

        updated_user.password = 'other_password';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user', function( done ) {

    db.User.create( sample_user )
    .then( user => {
      var options = {
        method: 'DELETE',
        url: baseRoute + '/' + user.id
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        // try to get deleted user from database
        db.User.findById( user.id )
        .then( user => {
          // Expect database reply to be undefined
          code.expect( user ).to.not.exist();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to delete an user that does not exist in the database
  lab.test( 'DELETE non-existing user', function( done ) {

    var options = {
      method: 'DELETE',
      url: baseRoute + '/' + way_over_highest_user_id
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
  lab.test( 'DELETE negative ID user', function( done ) {

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
