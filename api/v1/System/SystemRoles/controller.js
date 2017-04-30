'use strict';

var Boom = require( 'boom' );
var db = require( '../../../../database/models' );


// This function will create a new system role and return its details.
exports.create = ( request, reply ) =>
  db.sequelize.transaction( t => {
    let query = {
      where: {
        name: request.payload.name,
        deleted_at: null
      }
    };

    // check if name already exists
    return db.SystemRole.findOne( query, { transaction: t } )
      .then( role =>
        role ?
          Promise.reject( Boom.badRequest('name_already_exists') ) :
          null
      )
      .then( () => {
        let new_role = {
          name: request.payload.name,
          permissions: JSON.parse( request.payload.permissions )
        };

        for( var route in new_role.permissions ) {
          if( new_role.permissions.hasOwnProperty(route) ) {

            // TODO: check if 'route' is a valid route

            for( var permission in new_role.permissions[route] ) {
              if( new_role.permissions[route].hasOwnProperty(permission) ) {

                // TODO: check if 'permission' is a valid permission for the current route

                if( typeof(new_role.permissions[route][permission]) !== 'boolean' ) {
                  return Promise.reject( Boom.badRequest('permissions_must_be_boolean_values') );
                }

              }
            }

          }
        }

        return new_role;
      })
      // create the system role
      .then( new_role => db.SystemRole.create(new_role, { transaction: t }) );
  })
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function returns the details of all system roles
exports.readAll = ( request, reply ) => {
  let query = {
    order: 'id',
    limit: request.query.limit,
    offset: request.query.offset
  };

  // retrieve all system roles from database
  return db.SystemRole.scope([ 'withPermissions' ]).findAndCount( query )
    // reply with the information
    .then( reply )
    // catch any error that may have been thrown
    .catch( err =>
      err.isBoom ?
        reply( err ) :
        reply( Boom.badImplementation(err) )
    );
}


// This function returns the details of a specific system role
exports.readOne = ( request, reply ) =>
  // retrieve specified system role from database
  db.SystemRole.scope([ 'withPermissions' ]).findById( request.params.id )
  // check if requested system role exists
  .then( role =>
    !role ?
      Promise.reject( Boom.notFound('role_id_not_found') ) :
      // return the system role
      role
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function updates the details of an existing system role
exports.update = ( request, reply ) =>
  db.sequelize.transaction( t =>

    // retrieve specified system role from database
    db.SystemRole.findById( request.params.id, { transaction: t } )

    // check if requested system role exists
    .then( role =>
      !role ?
        Promise.reject( Boom.notFound('role_id_not_found') ) :
        // return requested system role
        role
    )

    // check if new name already exists for another system role
    .then( role => {
      if( request.payload.name ) {
        let query = {
          where: {
            name: request.payload.name,
            id: { $ne: request.params.id },
            deleted_at: null
          }
        };

        return db.SystemRole.findOne( query, { transaction: t } )
          .then( duplicated_name_role =>
            duplicated_name_role ?
              Promise.reject( Boom.badRequest('name_already_exists') ) :
              role
          );
      }
      else return role;
    })

    // update the system role
    .then( role => role.update(request.payload, { transaction: t }) )
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );


// This function soft-deletes an existing system role
exports.destroy = ( request, reply ) =>
  // retrieve specified system role from database
  db.SystemRole.findById( request.params.id )
  // check if requested system role exists
  .then( role =>
    !role ?
      Promise.reject( Boom.notFound('role_id_not_found') ) :
      // destroy the retrieved system role (soft-delete)
      role.destroy()
  )
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );
