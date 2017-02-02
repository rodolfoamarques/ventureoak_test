'use strict'; /* jshint ignore:line */

let api;


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
            defaultValue: 'demoKey',
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
              // TODO: handle "has credentials" scenario
            } else {
              // TODO: handle "no credentials" scenario
            }
          }
        }
      }
    ], err => {
      if( err ) { throw err; };

      // Setting the authorization strategy
      api.auth.strategy( 'jwt', 'jwt', {
        key: 'thisisarandomkey',
        validateFunc: (decoded, request, callback) => {
          // TODO
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

  // TODO: register routes here

  return api;
};
