'use strict';

var joi = require( 'joi' );
var controller = require( './controller' );

const endpoint = 'system_roles';

module.exports = [
  {
    method: 'POST',
    path: `/${endpoint}`,
    handler: controller.create,
    config: {
      description: 'Create new system role',
      notes: 'Create new system role',
      tags: ['api', 'v1', 'system_roles'],
      plugins: {
        hapiRouteAcl: {
          permissions: ['system_roles:create']
        }
      },
      validate: {
        payload:
          joi.object({
            name: joi.string().required().description('Role\'s name'),
            permissions: joi.string().required().description('List of permissions for the system role'),
          }).meta({ className: 'SystemRoleCreateModel' }).description('Create new system role form')
      }
    }
  },
  {
    method: 'GET',
    path: `/${endpoint}`,
    handler: controller.readAll,
    config: {
      id: 'paginated_system_roles_v1',
      description: 'List of all system roles',
      notes: 'List of all system roles',
      tags: ['api', 'v1', 'system_roles'],
      plugins: {
        hapiRouteAcl: {
          permissions: ['system_roles:readAll']
        }
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
      description: 'Show specific system role',
      notes: 'Show specific system role',
      tags: ['api', 'v1', 'system_roles'],
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
  },
  {
    method: 'PUT',
    path: `/${endpoint}/{id}`,
    handler: controller.update,
    config: {
      description: 'Update specific system role',
      notes: 'Update specific system role',
      tags: ['api', 'v1', 'system_roles'],
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
            name: joi.string().description('Role\'s name'),
            permissions: joi.string().description('List of permissions for the system role'),
          }).meta({ className: 'SystemRoleUpdateModel' }).description('Update existing system role form')
      }
    }
  },
  {
    method: 'DELETE',
    path: `/${endpoint}/{id}`,
    handler: controller.destroy,
    config: {
      description: 'Delete specific system role',
      notes: 'Delete specific system role',
      tags: ['api', 'v1', 'system_roles'],
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
  }
];
