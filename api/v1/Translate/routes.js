'use strict';

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
    tags: ['api', 'v1', 'translations'],
    plugins: {
      hapiRouteAcl: { permissions: ['translations:create'] }
    },
    validate: {
      payload:
        joi.object({
          english_text: joi.string().required().description('English text to translate'),
        }).meta({ className: 'TranslationCreateModel' }).description('Create new translation form')
    }
  }
}, {
  method: 'GET',
  path: `/${endpoint}`,
  handler: controller.readAll,
  config: {
    id: 'paginated_translations_v1',
    description: 'List of all translations',
    notes: 'List of all translations',
    tags: ['api', 'v1', 'translations'],
    plugins: {
      hapiRouteAcl: { permissions: ['translations:readAll'] }
    },
    validate: {
      query: {
        limit: joi.number().integer().min(1).description('Amount of elements per page'),
        offset: joi.number().integer().min(0).description('Page offset')
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
    tags: ['api', 'v1', 'translations'],
    plugins: {
      hapiRouteAcl: { permissions: ['translations:readOne'] }
    },
    validate: {
      params: {
        id: joi.number().integer().min(1).required().description('Translation\'s reference id')
      }
    }
  }
}];
