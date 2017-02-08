'use strict'; /* jshint ignore:line */

var joi = require( 'joi' );
var controller = require( './controller' );

const endpoint = 'translations';


module.exports = [
{
  method: 'POST',
  path: `/${endpoint}`,
  handler: controller.create,
  config: {
    description: 'Trasnlate English text to PigLatin',
    notes: 'Trasnlate English text to PigLatin',
    tags: ['api', 'translations'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['translations:create']
      }
    },
    validate: {
      payload:
        joi.object({
          id: joi.any().forbidden(),
          english_text: joi.string().required().description('English text to translate'),
          piglatin_text: joi.any().forbidden(),
          created_at: joi.any().forbidden(),
          updated_at: joi.any().forbidden(),
          deleted_at: joi.any().forbidden()
        }).meta({ className: 'TranslationCreateModel' }).description('Create new translation form')
    }
  }
}, {
  method: 'GET',
  path: `/${endpoint}`,
  handler: controller.readAll,
  config: {
    description: 'List of all translations',
    notes: 'List of all translations',
    tags: ['api', 'translations'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['translations:readAll']
      }
    }
  }
}, {
  method: 'GET',
  path: `/${endpoint}/{id}`,
  handler: controller.readOne,
  config: {
    description: 'Show previously translated text',
    notes: 'Show previously translated text',
    tags: ['api', 'translations'],
    plugins: {
      hapiRouteAcl: {
        permissions: ['translations:readOne']
      }
    },
    validate: {
      params: {
        id: joi.number().integer().min(1).required().description('Translation\'s reference id')
      }
    }
  }
}];
