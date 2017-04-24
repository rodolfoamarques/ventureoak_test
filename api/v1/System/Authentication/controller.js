'use strict';

var Boom = require( 'boom' );
var bcrypt = require( 'bcrypt' );
var moment = require( 'moment' );

var db = require( '../../../../database/models' );
var jwt_helper = require( '../../../../helpers/jwt_helper' );


// This function will verify the credentials of a login request
// and, if valid, generate a JWT to authenticate the user
exports.login = ( request, reply ) =>
  db.User.scope([ 'withRole', 'withPassword' ])
  // retrieve specific user from database
  .findOne({ where: { email: request.payload.email } })
  // check if requested user exists
  .then( user =>
    user ?
      user :
      Promise.reject( Boom.notFound('user_not_found') )
  )
  // check if the user is enabled
  .then( user =>
    user.enabled ?
      user :
      Promise.reject( Boom.unauthorized('user_disabled') )
  )
  // validate the provided password
  .then( user =>
    bcrypt.compareSync(request.payload.password, user.password) ?
      user :
      Promise.reject( Boom.unauthorized('incorrect_password') )
  )
  .then( user => {
    user = user.toJSON();
    delete user.password;
    user.last_login_at = moment();

    // sign a JWT to authenticate the user, valid for the next 12h
    var expiration = { value: 12, unit: 'h' };
    var user_token = jwt_helper.createToken( user.id, user.last_login_at, expiration );

    // update last login of the user
    return db.User.update( user, { where: { id: user.id } } )
      // and return the token + user info
      .then( () => Object.assign( { token: user_token }, user ) );
  })
  // reply with the information
  .then( reply )
  // catch any error that may have been thrown
  .catch( err =>
    err.isBoom ?
      reply( err ) :
      reply( Boom.badImplementation(err) )
  );



// This function will create a new user and return its details.
exports.register = ( request, reply ) =>
  db.sequelize.transaction( t =>

    // check if email already exists
    db.User.findOne({ where: { email: request.payload.email }/*, paranoid: false*/ })
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
      // hash the user's password
      request.payload.password = bcrypt.hashSync( request.payload.password, bcrypt.genSaltSync(10) );
      request.payload.role_id = 3;

      // save the user in the database
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
