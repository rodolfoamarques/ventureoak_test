'use strict'; /* jshint ignore:line */

let api;

var ffs = require( 'final-fs' );
var Promise = require( 'bluebird' );

var db = require( '../database/models' );
const configs = require( '../config/configs' );


exports.init = ( server ) => {

  if( api ) { return api; }

  server.connection({
    labels: ['api'],
    host: '127.0.0.1',
    port: 3666,
    routes: { cors: true }
  });

  api = server.select( 'api' );

  api.register(
    [
      require( 'inert' ),
      require( 'vision' ),
      require( 'hapi-auth-jwt2' ),
      require( 'akaya' ),
      {
        register: require( 'bissle' ),
        options: { absolute: false } // absolute {boolean} - If the pagination links (not the Link header) should be absolute or not.
      },
      {
        register: require( 'hapi-swaggered' ),
        options: {
          schemes: ['http'],
          auth: false
        }
      },
      {
        register: require( 'hapi-swaggered-ui' ),
        options: {
          path: '/docs',
          auth: false,
          authorization: {
            field: 'authorization',
            scope: 'header',
            // defaultValue: 'defaultKey',
            placeholder: 'Enter your apiKey here'
          },
          swaggerOptions: {
            validatorUrl: null
          }
        }
      },
      {
        register: require( 'hapi-route-acl' ),
        options: {
          permissionsFunc: (credentials, callback) => {
            if( credentials ) {
              return db.SystemRole.scope(['withPermissions'])
                .findById( credentials.role_id )
                .then( role => {
                  if( !role ) {
                    return callback( new Error('role_id_not_found'), null );
                  }
                  return callback( null, role.permissions );
                });
            } else {
              // TODO: THIS IS PROBABLY TOO RESTRICTIVE.
              return callback( null, {} );
            }
          }
        }
      }
    ], err => {
      if( err ) { throw err; };

      // Setting the authorization strategy
      api.auth.strategy( 'jwt', 'jwt', {
        key: configs.api_secret_key,
        validateFunc: (decoded, request, callback) => {
          db.User.findById( decoded.id )
          .then( user => {
            if( !user ) {
              return Promise.reject();
            } else {
              return callback( null, true, user.toJSON() );
            }
          })
          .catch( () => callback(new Error('error_found_in_jwt_validate_function'), false) )
        },
        verifyOptions: { algorithms: ['HS256'] }
      });
      api.auth.default( 'jwt' );

      api.route({
        path: '/',
        method: 'GET',
        handler: (request, reply) => reply.redirect( 'docs' ),
        config: {
          auth: false
        }
      });
    }
  );

  // Look through the routes in all the subdirectories
  // of the API and create a new route for each one
  ffs.readdirRecursiveSync( __dirname, true )
  .forEach( file => {

    if( file.endsWith('routes.js') ) {
      let routes = require( './' + file );
      api.route( routes );
    }
  });

  return api;
};
