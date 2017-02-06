'use strict'; /* jshint ignore:line */

var joi = require( 'joi' );
var controller = require( './controller' );

const endpoint = 'system_roles';

module.exports = [
{
  method: 'POST',
  path: `/${endpoint}`,
  handler: controller.create,
  config: {
    description: 'Create new role',
    notes: 'Create new role',
    tags: ['api', 'system_roles'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['system_roles:create']
      }
    },
    validate: {
      payload:
        joi.object({
          id: joi.any().forbidden(),
          name: joi.string().required().description('Role\'s name'),
          permissions: joi.string().required().description('List of permissions for the system role'),
          created_at: joi.any().forbidden(),
          updated_at: joi.any().forbidden(),
          deleted_at: joi.any().forbidden()
        }).meta({ className: 'SystemRoleCreateModel' }).description('Create new system role form')
    }
  }
}, {
  method: 'GET',
  path: `/${endpoint}`,
  handler: controller.readAll,
  config: {
    description: 'List of all system roles',
    notes: 'List of all system roles',
    tags: ['api', 'system_roles'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['system_roles:readAll']
      }
    }
  }
}, {
  method: 'GET',
  path: `/${endpoint}/{id}`,
  handler: controller.readOne,
  config: {
    description: 'Show specific system role',
    notes: 'Show specific system role',
    tags: ['api', 'system_roles'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['system_roles:readOne']
      }
    },
    validate: {
      params: {
        id: joi.number().integer().min(1).required().description('Role\'s reference id')
      }
    }
  }
}, {
  method: 'PUT',
  path: `/${endpoint}/{id}`,
  handler: controller.update,
  config: {
    description: 'Update specific system role',
    notes: 'Update specific system role',
    tags: ['api', 'system_roles'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['system_roles:update']
      }
    },
    validate: {
      params: {
        id: joi.number().integer().min(1).required().description('Role\'s reference id')
      },
      payload:
        joi.object({
          id: joi.any().forbidden(),
          name: joi.string().description('Role\'s name'),
          permissions: joi.string().description('List of permissions for the system role'),
          created_at: joi.any().forbidden(),
          updated_at: joi.any().forbidden(),
          deleted_at: joi.any().forbidden()
        }).meta({ className: 'SystemRoleUpdateModel' }).description('Update existing system role form')
    }
  }
}, {
  method: 'DELETE',
  path: `/${endpoint}/{id}`,
  handler: controller.destroy,
  config: {
    description: 'Delete specific system role',
    notes: 'Delete specific system role',
    tags: ['api', 'system_roles'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['system_roles:destroy']
      }
    },
    validate: {
      params: {
        id: joi.number().integer().min(1).required().description('Role\'s reference id')
      }
    }
  }
}];
