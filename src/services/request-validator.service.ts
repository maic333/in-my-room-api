import path from 'path';
import ApiRequest from '../types/api-request';
import { Validator } from 'jsonschema';
import { ApiHttpMethod } from '../types/api-http-method';

const jsValidator = new Validator();

class RequestValidatorService {
  schemas: { [name: string]: any } = {};

  /**
   * Load the schema for a given request
   */
  loadSchemaForRequest(reqMethod: ApiHttpMethod, reqPath: string) {
    // get request schema name
    const schemaName = this.getSchemaName(reqMethod, reqPath);

    // load schema file
    const schemaPath = path.resolve(
      path.join(__dirname, '../validation/requests', `${schemaName}.js`)
    );
    try {
      // cache schema
      this.schemas[schemaName] = require(schemaPath).schema;
    } catch (e) {
      throw new Error(`RequestValidatorService:: Schema not found: ${schemaName}`);
    }
  }

  /**
   * Validate a request
   */
  validateRequest(req: ApiRequest) {
    // get request schema name
    const schemaName = this.getSchemaName(req.method, req.route.path);

    // load schema
    const schema = this.schemas[schemaName];

    // validate the request
    const result = jsValidator.validate(req, schema);

    if (
      result.errors &&
      result.errors.length > 0
    ) {
      return result.errors;
    }

    return null;
  }

  private getSchemaName(reqMethod: string, reqPath: string): string {
    return reqMethod.toLowerCase() + reqPath.replace(/:([^\/]+)/g, '{$1}').replace(/\//g, '.');
  }
}

export const requestValidatorService = new RequestValidatorService();
