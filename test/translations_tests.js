'use strict'; /* jshint ignore:line */

var Lab = require( 'lab' );
var code = require( 'code' );
var moment = require( 'moment' );

var db = require( '../database/models' );

const lab = exports.lab = Lab.script();
const server = require( '../' ).select( 'api' );
const baseRoute = '/translations';


lab.experiment( 'Translations Endpoint', function() {

  var auth_tokens = {};
  var sample_translation = {
    english_text: 'some translation'
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


  // Test scenario to get all translations in the database
  lab.test( 'GET all translations - no authorization header', function( done ) {

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


  // Test scenario to get all translations in the database
  lab.test( 'GET all translations - invalid authorization token', function( done ) {

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


  // Test scenario to get all translations in the database
  lab.test( 'GET all translations - unauthorized user', function( done ) {

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


  // Test scenario to get all translations in the database
  lab.test( 'GET all translations - authorized user', function( done ) {

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

      // get all translations from database
      db.Translation.findAll()
      .then( translations => {
        // Expect result length to be equal to the database reply length
        code.expect( result.length ).to.be.equal( translations.length );

        for( let i=0; i<result.length; i++ ) {
          let translation = translations[i].toJSON();
          let res = result[i].toJSON();

          // Expect each translation in result to be equal to each translation in the database reply
          code.expect( res ).to.be.equal( translation );
        }

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to get a specific translation from the database
  lab.test( 'GET specific translation', function( done ) {

    // create a test translation
    sample_translation.piglatin_text = "omesay anslationtray";
    db.Translation.create( sample_translation )
    .then( created_translation => {

      let options = {
        method: 'GET',
        url: baseRoute + '/' + created_translation.id,
        headers: {
          authorization: auth_tokens.admin
        }
      }

      // server.inject allows a simulation of an http request
      server.inject( options, function( response ) {
        let result = response.result.toJSON();

        // Expect http response status code to be 200 ("Ok")
        code.expect( response.statusCode ).to.be.equal( 200 );

        db.Translation.findById( created_translation.id )
        .then( translation => {
          // Expect result to be equal to database reply
          code.expect( result ).to.be.equal( translation.toJSON() );

          // destroy the test translation
          translation.destroy();

          delete sample_translation.piglatin_text;

          // done() callback is required to end the test.
          server.stop( done );
        });
      });
    });

  });


  // Test scenario to get a specific translation from the database
  lab.test( 'GET specific translation - non-existing translation', function( done ) {

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


  // Test scenario to get a specific translation from the database
  lab.test( 'GET specific translation - zero ID translation', function( done ) {

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


  // Test scenario to get a specific translation from the database
  lab.test( 'GET specific translation - negative ID translation', function( done ) {

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


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - no authorization header', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation
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


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - invalid authorization token', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - unauthorized user', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - authorized user', function( done ) {

    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
      headers: {
        authorization: auth_tokens.admin
      }
    }

    // server.inject allows a simulation of an http request
    server.inject( options, function( response ) {
      let result = response.result.toJSON();
      result.piglatin_text = 'omesay anslationtray';
      delete result.created_at;
      delete result.updated_at;
      delete result.deleted_at;

      // Expect http response status code to be 200 ("Ok")
      code.expect( response.statusCode ).to.be.equal( 200 );

      // get created translation from database
      db.Translation.findById( result.id )
      .then( translation => {
        // Expect database reply to be equal to result
        code.expect( translation.toJSON() ).to.be.equal( result );

        // destroy the translation created with POST
        translation.destroy();

        // done() callback is required to end the test.
        server.stop( done );
      });
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - forbidden key (id)', function( done ) {

    sample_translation.id = 10;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      delete sample_translation.id;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - forbidden key (piglatin_text)', function( done ) {

    sample_translation.piglatin_text = "omesay anslationtray";
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      delete sample_translation.piglatin_text;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - forbidden key (created_at)', function( done ) {

    sample_translation.created_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      delete sample_translation.created_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - forbidden key (updated_at)', function( done ) {

    sample_translation.updated_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      delete sample_translation.updated_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - forbidden key (deleted_at)', function( done ) {

    sample_translation.deleted_at = moment();
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      delete sample_translation.deleted_at;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - extra key (non_existing_key)', function( done ) {

    sample_translation.non_existing_key = 'dummy value';
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      delete sample_translation.non_existing_key;

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - missing key (english_text)', function( done ) {

    delete sample_translation.english_text;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      sample_translation.english_text = 'some translation';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });


  // Test scenario to create a new translation in the database
  lab.test( 'POST new translation - invalid data (english_text must be a string)', function( done ) {

    sample_translation.english_text = true;
    let options = {
      method: 'POST',
      url: baseRoute,
      payload: sample_translation,
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

      sample_translation.english_text = 'some translation';

      // done() callback is required to end the test.
      server.stop( done );
    });

  });

});
