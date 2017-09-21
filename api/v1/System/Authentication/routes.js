'use strict';

var joi = require( 'joi' );
var controller = require( './controller' );

const endpoint = 'authentication';
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // taken from http://emailregex.com


module.exports = [
  {
    method: 'POST',
    path: `/${endpoint}/login`,
    handler: controller.login,
    config: {
      description: 'Login',
      notes: 'Login',
      tags: ['api', 'v1', 'authentication'],
      auth: false,
      validate: {
        payload:
          joi.object({
            email: joi.string().email().regex(email_regex).required().description('User\'s email'),
            password: joi.string().required().description('User\'s password'),
          }).meta({ className: 'loginModel' }).description('Login form')
      }
    }
  },
  {
    method: 'POST',
    path: `/${endpoint}/register`,
    handler: controller.register,
    config: {
      description: 'Registration of a new user',
      notes: 'Registration of a new user',
      tags: ['api', 'v1', 'authentication'],
      auth: false,
      validate: {
        payload:
          joi.object({
            email: joi.string().email().regex(email_regex).required().description('User\'s login email'),
            password: joi.string().required().description('User\'s login password'),
            password_confirmation: joi.string().required().description('Password confirmation'),
            full_name: joi.string().description('User\'s real full name'),
          }).meta({ className: 'registrationModel' }).description('Register new user form')
      }
    }
  }
];
