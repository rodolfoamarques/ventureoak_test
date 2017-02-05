'use strict'; /* jshint ignore:line */

var Lab = require( 'lab' );
var code = require( 'code' );
var bcrypt = require( 'bcrypt' );
var moment = require( 'moment' );

var db = require( '../database/models' );
var jwt_helper = require( '../helpers/jwt_helper' );

const lab = exports.lab = Lab.script();
const server = require( '../' ).select( 'api' );
const baseRoute = '/authentication';


lab.experiment( 'Authentication Endpoint', function() {

  var user = {
    email: 'user_sample@mail.com',
    password: bcrypt.hashSync( 'password', bcrypt.genSaltSync(10) ),
    full_name: 'Sample User',
    enabled: true,
    role_id: 3
  };
  var user_login_info = {
    email: user.email,
    password: 'password'
  };
  var admin = {
    email: 'admin_sample@mail.com',
    password: bcrypt.hashSync( 'password', bcrypt.genSaltSync(10) ),
    full_name: 'Sample Admin',
    enabled: true,
    role_id: 2
  };
  var admin_login_info = {
    email: admin.email,
    password: 'password'
  };
  var super_admin = {
    email: 'super_admin_sample@mail.com',
    password: bcrypt.hashSync( 'password', bcrypt.genSaltSync(10) ),
    full_name: 'Sample Super Admin',
    enabled: true,
    role_id: 1
  };
  var super_admin_login_info = {
    email: super_admin.email,
    password: 'password'
  };
  var new_user = {
    email: 'sample_register@mail.com',
    password: 'password',
    password_confirmation: 'password',
    full_name: 'Register User'
  }

  // Run before the first test
  lab.before( done => {

    db.User.create( user )
    .then( u => {
      db.SystemRole.findById( u.role_id )
      .then( role => {
        user = u.toJSON();
        user.role = role.toJSON();
        delete user.password;
        delete user.last_login_at;
        delete user.created_at;
        delete user.updated_at;
        delete user.deleted_at;
      });
    })
    .then( () => db.User.create(admin) )
    .then( u => {
      db.SystemRole.findById( u.role_id )
      .then( role => {
        admin = u.toJSON();
        admin.role = role.toJSON();
        delete admin.password;
        delete admin.last_login_at;
        delete admin.created_at;
        delete admin.updated_at;
        delete admin.deleted_at;
      });
    })
    .then( () => db.User.create(super_admin) )
    .then( u => {
      db.SystemRole.findById( u.role_id )
      .then( role => {
        super_admin = u.toJSON();
        super_admin.role = role.toJSON();
        delete super_admin.password;
        delete super_admin.last_login_at;
        delete super_admin.created_at;
        delete super_admin.updated_at;
        delete super_admin.deleted_at;
      });
    })
    .then( () => { done(); } );

  });


  // Run before every single test
  lab.beforeEach( done => { done(); } );


  // Run after the every single test
  lab.afterEach( done => { done(); } );


  // Run after the last test
  lab.after( done => {

    db.User.destroy( { where: { id: user.id } } )
    .then( () => db.User.destroy({ where: { id: admin.id } }) )
    .then( () => db.User.destroy({ where: { id: super_admin.id } }) )
    .then( () => { done(); } );

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - user', function( done ) {

    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // TODO: handle token verification
      delete result.token;

      // TODO: handle last login verification
      delete result.last_login_at;

      // Expect the logged in user to be user
      code.expect( result ).to.be.equal( user );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - admin', function( done ) {

    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: admin_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // TODO: handle token verification
      delete result.token;

      // TODO: handle last login verification
      delete result.last_login_at;

      // Expect the logged in user to be admin
      code.expect( result ).to.be.equal( admin );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - super admin', function( done ) {

    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: super_admin_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // TODO: handle token verification
      delete result.token;

      // TODO: handle last login verification
      delete result.last_login_at;

      // Expect the logged in user to be super_admin
      code.expect( result ).to.be.equal( super_admin );

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - invalid credentials (non-existing email)', function( done ) {

    user_login_info.email = "non.existing.email@mail.com"
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 404 ("Not Found")
      code.expect( response.statusCode ).to.be.equal( 404 );
      code.expect( response.statusMessage ).to.be.equal( 'Not Found' );

      user_login_info.email = user.email,

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST login - invalid credentials (email must be a valid email address)', function( done ) {

    user_login_info.email = 10;
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.email = user.email;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST login - invalid credentials (email must be a valid email address)', function( done ) {

    user_login_info.email = 'invalid_email';
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.email = user.email;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST login - invalid credentials (email must be a valid email address)', function( done ) {

    user_login_info.email = 'invalid@email';
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.email = user.email;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST login - invalid credentials (email must be a valid email address)', function( done ) {

    user_login_info.email = 'invalid@.com';
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.email = user.email;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST login - invalid credentials (email must be a valid email address)', function( done ) {

    user_login_info.email = '@mail.com';
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.email = user.email;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - missing credentials (no email)', function( done ) {

    delete user_login_info.email;
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.email = user.email;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - invalid credentials (wrong password)', function( done ) {

    user_login_info.password = 'wrong_password';
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 401 ("Unauthorized")
      code.expect( response.statusCode ).to.be.equal( 401 );
      code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

      user_login_info.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - missing credentials (no password)', function( done ) {

    delete user_login_info.password;
    var options = {
      method: 'POST',
      url: baseRoute + '/login',
      payload: user_login_info
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      user_login_info.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to get all roles in the database
  lab.test( 'POST login - disabled user', function( done ) {

    db.User.update( { enabled: false }, { where: { id: user.id } } )
    .then( user => {

      var options = {
        method: 'POST',
        url: baseRoute + '/login',
        payload: user_login_info
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        var result = response.result;

        // Expect http response status code to be 401 ("Unauthorized")
        code.expect( response.statusCode ).to.be.equal( 401 );
        code.expect( response.statusMessage ).to.be.equal( 'Unauthorized' );

        db.User.update( { enabled: true }, { where: { id: user.id } } )
        .then( () => {
          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to create a new user in the database
  lab.test( 'POST register new user', function( done ) {

    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;
      delete result.created_at;
      delete result.updated_at;
      delete result.deleted_at;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // get registered user from database
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

    new_user.id = 10;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.id;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 2 (forbidden: role_id)', function( done ) {

    new_user.role_id = 2;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.role_id;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 3 (forbidden: enabled)', function( done ) {

    new_user.enabled = false;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.enabled;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 4 (forbidden: last_login_at)', function( done ) {

    new_user.last_login_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.last_login_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 5 (forbidden: created_at)', function( done ) {

    new_user.created_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.created_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 6 (forbidden: updated_at)', function( done ) {

    new_user.updated_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.updated_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with forbidden keys
  lab.test( 'POST new user with forbidden keys - part 7 (forbidden: deleted_at)', function( done ) {

    new_user.deleted_at = moment();
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.deleted_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with inexistent keys in the model
  lab.test( 'POST new user with extra information (extra: non_existing_key)', function( done ) {

    new_user.non_existing_key = 'dummy value';
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      delete new_user.non_existing_key;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 1 (email missing)', function( done ) {

    delete new_user.email;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 2 (password missing)', function( done ) {

    delete new_user.password_confirmation;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.password_confirmation = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with required parameters missing
  lab.test( 'POST new user with missing data - part 3 (password_confirmation missing)', function( done ) {

    delete new_user.password;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.0 (email must be a valid email address)', function( done ) {

    new_user.email = 10;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.1 (email must be a valid email address)', function( done ) {

    new_user.email = 'invalid_email';
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.2 (email must be a valid email address)', function( done ) {

    new_user.email = 'invalid@email';
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.3 (email must be a valid email address)', function( done ) {

    new_user.email = 'invalid@.com';
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.4 (email must be a valid email address)', function( done ) {

    new_user.email = '@mail.com';
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 1.5 (email must be unique)', function( done ) {

    new_user.email = user.email;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.email = 'sample_register@mail.com';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 2 (full_name must be a string)', function( done ) {

    new_user.full_name = true;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.full_name = 'Sample User';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 3.0 (password_confirmation must be a string)', function( done ) {

    new_user.password_confirmation = 1234;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.password_confirmation = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 3.1 (password must be a string)', function( done ) {

    new_user.password = 1234;
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new user in the database with invalid values
  lab.test( 'POST new user with invalid data - part 3.2 (password must be equal to password_confirmation)', function( done ) {

    new_user.password = 'not_password';
    var options = {
      method: 'POST',
      url: baseRoute + '/register',
      payload: new_user
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      var result = response.result;

      // Expect http response status code to be 400 ("Bad Request")
      code.expect( response.statusCode ).to.be.equal( 400 );
      code.expect( response.statusMessage ).to.be.equal( 'Bad Request' );

      new_user.password = 'password';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });

});
