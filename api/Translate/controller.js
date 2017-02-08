'use strict'; /* jshint ignore:line */

var boom = require( 'boom' );
var Promise = require( 'bluebird' );

var db = require( '../../database/models' );
var pg_helper = require( '../../helpers/piglatin_helper' );


// This function will create a new translation and return its details.
exports.create = ( request, reply ) => {
  db.sequelize.transaction( t =>

    // check if translation exists
    db.Translation.findOne( { where: { english_text: request.payload.english_text } }, { transaction: t } )
    .then( translation => {
      if( translation ) {
        // and return it
        return translation;
      }
      else {
        // or create a new translation
        let new_translation = {
          english_text: request.payload.english_text,
          piglatin_text: pg_helper.translate_text( request.payload.english_text )
        };

        // and save it to database
        return db.Translation.create(new_translation, { transaction: t })
      }
    })
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( boom.badImplementation(err) )
  );
}


// This function returns the details of all translations
exports.readAll = ( request, reply ) =>
  // retrieve all translations from database
  db.Translation.findAll()
  // reply with the information
  .then( reply )
  .then( translations => reply.bissle({ translations }, { key: "translations"}) )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( boom.badImplementation(err) )
  );


// This function returns the details of a specific translation
exports.readOne = ( request, reply ) =>
  // retrieve specified translation from database
  db.Translation.findById( request.params.id )
  // check if requested translation exists
  .then( translation =>
    !translation ?
      Promise.reject( boom.notFound('translation_id_not_found') ) :
      // return the translation
      translation
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( boom.badImplementation(err) )
  );
