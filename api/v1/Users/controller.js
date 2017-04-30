'use strict';

var Boom = require( 'boom' );
var Bcrypt = require( 'bcrypt' );

var db = require( '../../../database/models' );
const configs = require( '../../../config/configs' );


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
    .then( () => {
      let query = {
        where: {
          email: request.payload.email,
          deleted_at: null
        }
      };

      return db.User.findOne( query );
    })
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

    // hash the password
    .then( () => Bcrypt.hash(request.payload.password, configs.saltRounds) )
    // create the user
    .then( hash => {
      request.payload.password = hash;

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
exports.readAll = ( request, reply ) => {
  let query = {
    order: 'id',
    limit: request.query.limit,
    offset: request.query.offset
  };

  // retrieve all users from database
  db.User.scope([ 'defaultScope', 'withRole' ]).findAndCount( query )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );
}


// This function returns the details of a specific user
exports.readOne = ( request, reply ) =>
  // retrieve specified user from database
  db.User.scope([ 'defaultScope', 'withRole' ]).findById( request.params.id )
  // check if requested user exists
  .then( user =>
    !user ?
      Promise.reject( Boom.notFound('user_id_not_found') ) :
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
      else return user;
    })

    // check if password and password_confirmation match
    .then( user => {
      if( request.payload.password ) {
        return request.payload.password === request.payload.password_confirmation ?
          user :
          Promise.reject( Boom.badRequest('passwords_do_not_match') );
      }
      else return user;
    })

    // check if new email already exists for another user
    .then( user => {
      if( request.payload.email ) {
        let query = {
          where: {
            email: request.payload.email,
            id: { $ne: request.params.id },
            deleted_at: null
          }
        };

        return db.User.findOne( query )
          .then( duplicated_email_user =>
            duplicated_email_user ?
              Promise.reject( Boom.badRequest('email_already_exists') ) :
              user
          );
      }
      else return user;
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
