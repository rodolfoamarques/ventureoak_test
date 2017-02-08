'use strict'; /* jshint ignore:line */

var Boom = require( 'boom' );
var Bcrypt = require( 'bcrypt' );
var Promise = require( 'bluebird' );

var db = require( '../../database/models' );


// This function will create a new user and return its details.
exports.create = ( request, reply ) =>
  db.sequelize.transaction( t =>

    // check if role exists
    db.SystemRole.findById( request.payload.role_id, { transaction: t } )
    .then( role =>
      !role ?
        Promise.reject( Boom.notFound('role_id_not_found') ) :
        null
    )

    // check if email already exists
    .then( () => db.User.findOne({ where: { email: request.payload.email, deleted_at: null } }) )
    .then( user =>
      user ?
        Promise.reject( Boom.badRequest('email_already_exists') ) :
        null
    )

    // check if password and password_confirmation match
    .then( () =>
      request.payload.password === request.payload.password_confirmation ?
        null :
        Promise.reject( Boom.badRequest('passwords_do_not_match') )
    )

    // create the user
    .then( () => {
      // encrypt the user's password
      request.payload.password = Bcrypt.hashSync( request.payload.password, Bcrypt.genSaltSync(10) );

      // create the user
      return db.User.create( request.payload, { transaction: t } )
        .then( user => {
          user = user.toJSON();
          delete user.password;
          return user;
        });
    })
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function returns the details of all users
exports.readAll = ( request, reply ) =>
  // retrieve all users from database
  db.User.scope([ 'defaultScope', 'withRole' ]).findAll()
  // reply with the information
  .then( users => reply.bissle({ users }, { key: "users"}) )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function returns the details of a specific user
exports.readOne = ( request, reply ) =>
  // retrieve specified user from database
  db.User.scope([ 'defaultScope', 'withRole' ]).findById( request.params.id )
  // check if requested user exists
  .then( user =>
    !user ?
      Promise.reject( Boom.notFound('user_id_not_found') ) :
      // return the user
      user
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function updates the details of an existing user
exports.update = ( request, reply ) =>
  db.sequelize.transaction( t =>

    // retrieve specified user from database
    db.User.findById( request.params.id, { transaction: t } )

    // check if requested user exists
    .then( user =>
      !user ?
        Promise.reject( Boom.notFound('user_id_not_found') ) :
        // return requested user
        user
    )

    // check if role exists
    .then( user => {
      if( request.payload.role_id ) {
        return db.SystemRole.findById( request.payload.role_id, { transaction: t } )
          .then( role =>
            !role ?
              Promise.reject( Boom.notFound('role_id_not_found') ) :
              user
          );
      }
      else {
        return user;
      }
    })

    // check if password and password_confirmation match
    .then( user => {
      if( request.payload.password ) {
        return request.payload.password === request.payload.password_confirmation ?
          user :
          Promise.reject( Boom.badRequest('passwords_do_not_match') );
      }
      else {
        return user;
      }
    })

    // check if new email already exists for another user
    .then( user => {
      if( request.payload.email ) {
        return db.User.findOne({ where: {email: request.payload.email, id: {$ne: request.params.id}, deleted_at: null} })
        .then( duplicated_email_user =>
          duplicated_email_user ?
            Promise.reject( Boom.badRequest('email_already_exists') ) :
            user
        );
      }
      else {
        return user;
      }
    })

    // update the user
    .then( user => user.update(request.payload, { transaction: t }) )
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function soft-deletes an existing user
exports.destroy = ( request, reply ) =>
  // retrieve specified user from database
  db.User.findById( request.params.id )
  // check if requested user exists
  .then( user =>
    !user ?
      Promise.reject( Boom.notFound('user_id_not_found') ) :
      // destroy the retrieved user (soft-delete)
      user.destroy()
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );
