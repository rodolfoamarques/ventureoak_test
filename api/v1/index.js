'use strict';

var ffs = require( 'final-fs' );

const path_version = '/api/v1';


exports.loadRoutes = ( server ) => {

  // Look through the routes in all the subdirectories
  // of the API and create a new route for each one
  ffs.readdirRecursiveSync( __dirname, true )
  .forEach( file => {
    if( file.endsWith('routes.js') ) {
      let routes = require( './' + file );

      routes = routes.map( route => {
        route.path = path_version + route.path;
        return route;
      });

      server.route( routes );
    }
  });

  return server;

};
