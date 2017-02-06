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

  var auth_tokens = {};

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

    let login_info = {
      super_admin: {
        email: 'demo1@mail.com',
        password: 'password'
      },
      admin: {
        email: 'demo2@mail.com',
        password: 'password'
      },
      user: {
        email: 'demo3@mail.com',
        password: 'password'
      }
    };

    let options = {
      method: 'POST',
      url: '/authentication/login'
    };

    // perform login with super_admin user to get authorization token
    options.payload = login_info.super_admin;

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      auth_tokens.super_admin = result.token;
    });

    // perform login with admin user to get authorization token
    options.payload = login_info.admin;

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      auth_tokens.admin = result.token;
    });

    // perform login with user user to get authorization token
    options.payload = login_info.user;

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      auth_tokens.user = result.token;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Run before every single test
  lab.beforeEach( done => { done(); } );


  // Run after the every single test
  lab.afterEach( done => { done(); } );


  // Run after the last test
  lab.after( done => { done(); });


  // Test scenario to get all users in the database
  lab.test( 'GET all users - no authorization header', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all users in the database
  lab.test( 'GET all users - invalid authorization token', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute,
      headers: {
        authorization: 'this_is_an_invalid_token'
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all users in the database
  lab.test( 'GET all users - unauthorized user', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute,
      headers: {
        authorization: auth_tokens.super_admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all users in the database
  lab.test( 'GET all users - authorized user', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // get all users from database
      db.User.scope(['withRole']).findAll()
      .then( users => {
        // Expect result length to be equal to the database reply length
        code.expect( result.length ).to.be.equal( users.length );

        for( let i=0; i<result.length; i++ ) {
          let user = users[i].toJSON();
          let res = result[i].toJSON();

          // Expect each user in result to be equal to each user in the database
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

      let options = {
        method: 'GET',
        url: baseRoute + '/' + created_user.id,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result.toJSON();

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


  // Test scenario to get a specific user from the database
  lab.test( 'GET specific user - non-existing user', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute + '/124124124124124124',
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 404 ("Not Found")
      code.expect( response.statusCode ).to.be.equal( 404 );
      code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get a specific user from the database
  lab.test( 'GET specific user - zero ID user', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute + '/0',
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get a specific user from the database
  lab.test( 'GET specific user - negative ID user', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute + '/-1',
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - no authorization header', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid authorization token', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: 'this_is_an_invalid_token'
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - unauthorized user', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.super_admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - authorized user', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;
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


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - forbidden key (id)', function( done ) {

    sample_user.id = 10;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.id;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - forbidden key (enabled)', function( done ) {

    sample_user.enabled = false;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.enabled;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - forbidden key (last_login_at)', function( done ) {

    sample_user.last_login_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.last_login_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - forbidden key (created_at)', function( done ) {

    sample_user.created_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.created_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - forbidden key (updated_at)', function( done ) {

    sample_user.updated_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.updated_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - forbidden key (deleted_at)', function( done ) {

    sample_user.deleted_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.deleted_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - extra key (non_existing_key)', function( done ) {

    sample_user.non_existing_key = 'dummy value';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete sample_user.non_existing_key;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - missing key (email)', function( done ) {

    delete sample_user.email;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - missing key (role_id)', function( done ) {

    delete sample_user.role_id;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - missing key (password_confirmation)', function( done ) {

    delete sample_user.password_confirmation;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password_confirmation = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - missing key (password)', function( done ) {

    delete sample_user.password;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (email must be a string)', function( done ) {

    sample_user.email = 10;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (email must be a valid email address) v1', function( done ) {

    sample_user.email = 'invalid_email';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (email must be a valid email address) v2', function( done ) {

    sample_user.email = 'invalid@email';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (email must be a valid email address) v3', function( done ) {

    sample_user.email = 'invalid@.com';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (email must be a valid email address) v4', function( done ) {

    sample_user.email = '@mail.com';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.email = 'sample@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (email must be unique)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      // attempt to POST a new user with the same email as the test user
      updated_user.email = sample_user.email;
      let options = {
        method: 'POST',
        url: baseRoute,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (role_id must be a number)', function( done ) {

    sample_user.role_id = 'not a number';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (role_id must be an integer)', function( done ) {

    sample_user.role_id = 1.1241;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (role_id must be an integer larger than or equal to 1) v1', function( done ) {

    sample_user.role_id = 0;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (role_id must be an integer larger than or equal to 1) v2', function( done ) {

    sample_user.role_id = -123;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (role_id must be a valid reference)', function( done ) {

    sample_user.role_id = 1512512125;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 404 ("Not Found")
      code.expect( response.statusCode ).to.be.equal( 404 );
      code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

      sample_user.role_id = 3;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (full_name must be a string)', function( done ) {

    sample_user.full_name = true;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.full_name = 'Sample User';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (password_confirmation must be a string)', function( done ) {

    sample_user.password_confirmation = 1234;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password_confirmation = 'other_password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (password must be a string)', function( done ) {

    sample_user.password = 1234;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password = 'other_password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST new user - invalid data (password must be equal to password_confirmation)', function( done ) {

    sample_user.password = 'not_password';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_user,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      sample_user.password = 'other_password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - no authorization header', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the user created with POST
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid authorization token', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: 'this_is_an_invalid_token'
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the user created with POST
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - unauthorized user', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.super_admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the user created with POST
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - authorized user', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result.toJSON();
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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - forbidden key (id)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.id = 10;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - forbidden key (created_at)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.created_at = moment();
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - forbidden key (updated_at)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.updated_at = moment();
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - forbidden key (deleted_at)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.deleted_at = moment();
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - extra key (non_existing_key)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.non_existing_key = 'dummy value';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 10;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be a valid email address) v1', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid_email';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be a valid email address) v2', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid@email';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be a valid email address) v3', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid@email';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be a valid email address) v4', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = 'invalid@.com';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be a valid email address) v5', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.email = '@mail.com';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (email must be unique)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    // create a second test user
    .then( () => db.User.create(updated_user) )
    .then( user => {

      // change the email of the second test user to match the first
      updated_user.email = sample_user.email;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // try to PUT the information
      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (role_id must be a number)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 'not a number';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (role_id must be an integer)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 1.1241;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (role_id must be an integer larger than or equal to 1) v1', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 0;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (role_id must be an integer larger than or equal to 1) v2', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = -123;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (role_id must be a valid reference)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.role_id = 1214251265;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 404 ("Not Found")
        code.expect( response.statusCode ).to.be.equal( 404 );
        code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

        // destroy the test user
        user.destroy();

        updated_user.role_id = 3;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (full_name must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.full_name = true;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (password_confirmation must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.password_confirmation = 1234;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (password must be a string)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.password = 1234;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to update an existing user in the database
  lab.test( 'PUT to existing user - invalid data (password must be equal to password_confirmation)', function( done ) {

    // create a test user
    db.User.create( sample_user )
    .then( user => {

      updated_user.password = 'not_password';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + user.id,
        payload: updated_user,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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
  lab.test( 'DELETE specific user - no authorization header', function( done ) {

    db.User.create( sample_user )
    .then( user => {
      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + user.id
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the test user
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user - invalid authorization token', function( done ) {

    db.User.create( sample_user )
    .then( user => {
      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + user.id,
        headers: {
          authorization: 'this_is_an_invalid_token'
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the test user
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user - unauthorized user', function( done ) {

    db.User.create( sample_user )
    .then( user => {
      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + user.id,
        headers: {
          authorization: auth_tokens.super_admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the test user
        user.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user - authorized user', function( done ) {

    db.User.create( sample_user )
    .then( user => {
      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + user.id,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user - non-existing user', function( done ) {

    let options = {
      method: 'DELETE',
      url: baseRoute + '/124124124124124124',
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 404 ("Not Found")
      code.expect( response.statusCode ).to.be.equal( 404 );
      code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user - zero ID user', function( done ) {

    let options = {
      method: 'DELETE',
      url: baseRoute + '/0',
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to delete a specific user from the database
  lab.test( 'DELETE specific user - negative ID user', function( done ) {

    let options = {
      method: 'DELETE',
      url: baseRoute + '/-1',
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });

});
