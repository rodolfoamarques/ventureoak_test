'use strict';

var moment = require( 'moment' );
var JWT = require( 'jsonwebtoken' );

const configs = require( '../config/configs' );


// Function that generates a temporary token for user to reset it's password
exports.createToken = ( user_id, login_date, expiration ) => {
  return JWT.sign({
      id: user_id,
      exp: parseInt( login_date.add(expiration.value, expiration.unit).format('x') )
    }, configs.api_secret_key );
}


// Function that generates a temporary token for user to reset it's password
exports.decryptToken = ( encrypted_token ) => {
  var token = new Buffer(encrypted_token, 'base64').toString('ascii');
  return JWT.decode( token, configs.api_secret_key );
}
