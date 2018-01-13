'use strict'; /* jshint ignore:line */

var Lab = require( 'lab' );
var code = require( 'code' );
var moment = require( 'moment' );

var db = require( '../database/models' );

const lab = exports.lab = Lab.script();
const server = require( '../' ).select( 'api' );
const baseRoute = '/system_roles';


lab.experiment( 'Roles Endpoint', function() {

  var auth_tokens = {};

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


  // Test scenario to get all roles in the database
  lab.test( 'GET all roles - no authorization header', function( done ) {

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


  // Test scenario to get all roles in the database
  lab.test( 'GET all roles - invalid authorization token', function( done ) {

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


  // Test scenario to get all roles in the database
  lab.test( 'GET all roles - unauthorized user', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute,
      headers: {
        authorization: auth_tokens.user
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


  // Test scenario to get all roles in the database
  lab.test( 'GET all roles - authorized user', function( done ) {

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

      // get all roles from database
      db.SystemRole.scope([ 'withPermissions' ]).findAll()
      .then( roles => {
        // Expect result length to be equal to the database reply length
        code.expect( result.roles.length ).to.be.equal( roles.length );

        result.roles.map( (element, index) => {
          let role = roles[index].toJSON();
          // Expect each role in result to be equal to each role in the database reply
          code.expect( element.toJSON() ).to.be.equal( role );
        });

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

      let options = {
        method: 'GET',
        url: baseRoute + '/' + created_role.id,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result.toJSON();

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        db.SystemRole.scope([ 'withPermissions' ]).findById( created_role.id )
        .then( role => {
          // Expect result to be equal to database reply
          code.expect( result ).to.be.equal( role.toJSON() );

          // destroy the test role
          role.destroy();

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to get a specific role from the database
  lab.test( 'GET specific role - non-existing role', function( done ) {

    let options = {
      method: 'GET',
      url: baseRoute + '/124124124124124',
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


  // Test scenario to get a specific role from the database
  lab.test( 'GET specific role - zero ID role', function( done ) {

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


  // Test scenario to get a specific role from the database
  lab.test( 'GET specific role - negative ID role', function( done ) {

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


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - no authorization header', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role
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


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - invalid authorization token', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - unauthorized role', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
      headers: {
        authorization: auth_tokens.user
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


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - authorized role', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result.toJSON();
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


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - forbidden key (id)', function( done ) {

    sample_role.id = 10;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      delete sample_role.id;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - forbidden key (created_at)', function( done ) {

    sample_role.created_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      delete sample_role.created_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - forbidden key (updated_at)', function( done ) {

    sample_role.updated_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      delete sample_role.updated_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - forbidden key (deleted_at)', function( done ) {

    sample_role.deleted_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      delete sample_role.deleted_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - extra key (non_existing_key)', function( done ) {

    sample_role.non_existing_key = 'dummy value';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      delete sample_role.non_existing_key;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - missing key (name)', function( done ) {

    delete sample_role.name;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      sample_role.name = 'sample_role';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - missing key (permissions)', function( done ) {

    delete sample_role.permissions;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      sample_role.permissions = '{ "some_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - invalid data (name must be a string)', function( done ) {

    sample_role.name = true;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      sample_role.name = 'sample_role';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new role in the database
  lab.test( 'POST new role - invalid data (name must be a unique)', function( done ) {

    sample_role.name = 'user';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      sample_role.name = 'sample_role';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });

/*
  // Test scenario to create a new role in the database
  lab.test( 'POST new role with invalid data - part 2 (permissions must be a valid json object)', function( done ) {

    sample_role.permissions = '?????';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_role,
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

      sample_role.permissions = '{ "some_route": { "create": true, "readAll": true, "readOne": true, "update": true, "destroy": true } }';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });
*/

  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - no authorization header', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the role created with POST
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - invalid authorization token', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the role created with POST
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - unauthorized role', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
        headers: {
          authorization: auth_tokens.user
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the role created with POST
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - authorized role', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result.toJSON();
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


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - forbidden key (id)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.id = 10;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        delete updated_role.id;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - forbidden key (created_at)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.created_at = moment();
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        delete updated_role.created_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - forbidden key (updated_at)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.updated_at = moment();
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        delete updated_role.updated_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - forbidden key (deleted_at)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.deleted_at = moment();
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        delete updated_role.deleted_at;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - extra key (non_existing_key)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.non_existing_key = 'dummy value';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        delete updated_role.non_existing_key;

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - invalid data (name must be a string)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.name = 10;
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        updated_role.name = 'updated_role';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - invalid data (name must be unique)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.name = 'admin';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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

        // destroy the test role
        role.destroy();

        updated_role.email = 'updated_role';

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });

/*
  // Test scenario to update an existing role in the database
  lab.test( 'PUT to existing role - invalid data (permissions must be a valid json object)', function( done ) {

    // create a test role
    db.SystemRole.create( sample_role )
    .then( role => {

      updated_role.permissions = '';
      let options = {
        method: 'PUT',
        url: baseRoute + '/' + role.id,
        payload: updated_role,
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
  lab.test( 'DELETE specific role - no authorization header', function( done ) {

    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + role.id
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the test role
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role - invalid authorization token', function( done ) {

    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + role.id,
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

        // destroy the test role
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role - unauthorized role', function( done ) {

    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + role.id,
        headers: {
          authorization: auth_tokens.user
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        // destroy the test role
        role.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role - authorized role', function( done ) {

    db.SystemRole.create( sample_role )
    .then( role => {

      let options = {
        method: 'DELETE',
        url: baseRoute + '/' + role.id,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result;

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


  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role - non-existing role', function( done ) {

    let options = {
      method: 'DELETE',
      url: baseRoute + '/124124124124124',
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


  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role - zero ID role', function( done ) {

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


  // Test scenario to delete a specific role from the database
  lab.test( 'DELETE specific role - negative ID user', function( done ) {

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
