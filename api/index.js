'use strict';

let api;


var db = require( '../database/models' );
const configs = require( '../config/configs' );

// Handler method for access control validation
var aclHandlerFunc = (credentials, callback) => {
  if( credentials ) {
    return db.SystemRole.scope(['withPermissions'])
      .findById( credentials.role_id )
      .then( role => {
        if( !role ) {
          return callback( new Error('role_id_not_found'), null );
        }
        return callback( null, role.permissions );
      });
  }
  else {
    // TODO: THIS IS PROBABLY TOO RESTRICTIVE.
    return callback( null, {} );
  }
}

// Handler method for authentication validation
var authHandlerFunc = (decoded, request, callback) => {
  db.User.findById( decoded.id )
  .then( user => {
    if( !user ) {
      return Promise.reject( 'error_in_jwt_validation' );
    } else {
      return callback( null, true, user.toJSON() );
    }
  })
  .catch( err => callback(new Error(err), false) )
}


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
        options: { absolute: false }
      },
      {
        register: require( 'hapi-swaggered' ),
        options: {
          schemes: ['http'],
          stripPrefix: '/api',
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
            placeholder: 'Enter your JWT here'
          },
          swaggerOptions: {
            apisSorter: 'alpha',
            validatorUrl: false,
            docExpansion: 'list',
            operationsSorter: 'method'
          }
        }
      },
      {
        register: require( 'hapi-route-acl' ),
        options: { permissionsFunc: aclHandlerFunc }
      }
    ], err => {
      if( err ) { throw err; };

      // Setting the authorization strategy
      api.auth.strategy( 'jwt', 'jwt', {
        key: configs.api_secret_key,
        validateFunc: authHandlerFunc,
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

  require('./v1').loadRoutes( api );

  return api;
};
