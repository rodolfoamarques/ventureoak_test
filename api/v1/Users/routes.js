'use strict';

var joi = require( 'joi' );
var controller = require( './controller' );

const endpoint = 'users';
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // taken from http://emailregex.com

module.exports = [
  {
    method: 'POST',
    path: `/${endpoint}`,
    handler: controller.create,
    config: {
      description: 'Create user',
      notes: 'Create user',
      tags: ['api', 'v1', 'users'],
      plugins: {
        hapiRouteAcl: { permissions: ['users:create'] }
      },
      validate: {
        payload:
          joi.object({
            email: joi.string().email().regex(email_regex).required().description('User\'s login email'),
            password: joi.string().required().description('User\'s login password'),
            password_confirmation: joi.string().required().description('Password confirmation'),
            full_name: joi.string().description('User\'s real full name'),
            role_id: joi.number().integer().min(1).required().description('User\'s role (reference id)'),
          }).meta({ className: 'UserCreateModel' }).description('Create new user form')
      }
    }
  },
  {
    method: 'GET',
    path: `/${endpoint}`,
    handler: controller.readAll,
    config: {
      id: 'paginated_users_v1',
      description: 'List of all users',
      notes: 'List of all users',
      tags: ['api', 'v1', 'users'],
      plugins: {
        hapiRouteAcl: { permissions: ['users:readAll'] }
      },
      validate: {
        query: {
          limit: joi.number().integer().min(1).description('Amount of elements per page'),
          offset: joi.number().integer().min(0).description('Page offset')
        }
      }
    }
  },
  {
    method: 'GET',
    path: `/${endpoint}/{id}`,
    handler: controller.readOne,
    config: {
      description: 'Show specific user',
      notes: 'Show specific user',
      tags: ['api', 'v1', 'users'],
      plugins: {
        hapiRouteAcl: { permissions: ['users:readOne'] }
      },
      validate: {
        params: {
          id: joi.number().integer().min(1).required().description('User\'s reference id')
        }
      }
    }
  },
  {
    method: 'PUT',
    path: `/${endpoint}/{id}`,
    handler: controller.update,
    config: {
      description: 'Update specific user',
      notes: 'Update specific user',
      tags: ['api', 'v1', 'users'],
      plugins: {
        hapiRouteAcl: { permissions: ['users:update'] }
      },
      validate: {
        params: {
          id: joi.number().integer().min(1).required().description('User\'s reference id')
        },
        payload:
          joi.object({
            email: joi.string().email().regex(email_regex).description('User\'s login email'),
            password: joi.string().description('User\'s login password'),
            password_confirmation: joi.string().description('Password confirmation'),
            full_name: joi.string().description('User\'s real full name'),
            role_id: joi.number().integer().min(1).description('User\'s role (reference id)'),
            enabled: joi.boolean().description('Flag to enable/disable the user on the system'),
          }).meta({ className: 'UserUpdateModel' }).description('Update existing user from')
      }
    }
  },
  {
    method: 'DELETE',
    path: `/${endpoint}/{id}`,
    handler: controller.destroy,
    config: {
      description: 'Delete specific user',
      notes: 'Delete specific user',
      tags: ['api', 'v1', 'users'],
      plugins: {
        hapiRouteAcl: { permissions: ['users:destroy'] }
      },
      validate: {
        params: {
          id: joi.number().integer().min(1).required().description('User\'s reference id')
        }
      }
    }
  }
];
