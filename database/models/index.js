'use strict'; /* jshint ignore:line */

var fs = require( 'fs' );
var path = require( 'path' );
var Sequelize = require( 'sequelize' );

var db = {};
var basename = path.basename( module.filename );
var env = process.env.NODE_ENV || 'development';

var config = require( __dirname + '/../../config/database.json' )[env];


if( config.use_env_variable ) {
  var sequelize = new Sequelize( process.env[config.use_env_variable] );
} else {
  var sequelize = new Sequelize( config.database, config.username, config.password, config );
}

fs
  .readdirSync( __dirname )
  .filter( function( file ) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach( function( file ) {
    var model = sequelize['import']( path.join(__dirname, file) );
    db[model.name] = model;
  });

Object.keys( db ).forEach( function( modelName ) {
  if( db[modelName].associate ) {
    db[modelName].associate( db );
  }
  if( db[modelName].addScopes ) {
    db[modelName].addScopes( db );
  }
  if( db[modelName].addHooks ) {
    db[modelName].addHooks( db );
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
