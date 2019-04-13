import { Express, NextFunction } from 'express';
import { ApiHttpMethod } from 'api-http-method.ts';
import ApiRequest from '../types/api-request';
import path from 'path';
import fs from 'fs';
import { requestValidatorService } from './request-validator.service';
import RouteConfig from '../types/route-config';
import checkAuthentication from '../middleware/check-authentication.middleware';
import ApiResponse from '../types/api-response';
import { ApiRequestHandler } from '../types/api-request-handler';

class ApiRegistryService {
  private app: Express;

  /**
   * Initialize service
   */
  init(app: Express) {
    this.app = app;

    // discover controllers
    const controllersPath = path.resolve(
      path.join(__dirname, '../controllers')
    );
    fs.readdir(controllersPath, (err, dir) => {
      dir
      // keep only .js files
        .filter((fileName: string) => fileName.endsWith('.js'))
        .map((fileName: string) => {
          // import file
          require(path.join(controllersPath, fileName));
        });
    });
  }

  /**
   * Register a new route
   */
  registerRoute(
    route: string,
    httpMethod: ApiHttpMethod,
    config: RouteConfig,
    handler: (req: ApiRequest, res: ApiResponse, next?: NextFunction) => any
  ) {
    if (!this.app) {
      throw new Error('ApiRegistryService:: service was not initialized');
    }

    const apiRoute = `/api/${route}`;

    // load validation schema for request
    requestValidatorService.loadSchemaForRequest(httpMethod, apiRoute);

    // prepare handlers
    const handlers: ApiRequestHandler[] = [];

    // validate the request
    handlers.push(
      (req: ApiRequest, res: ApiResponse, next: NextFunction) => {
        const error = requestValidatorService.validateRequest(req);

        if (error) {
          // return error
          res
            .status(400)
            .json({error});
        } else {
          // continue
          next();
        }
      }
    );

    // check authentication?
    if (config.checkAuth) {
      handlers.push(
        checkAuthentication()
      );
    }

    // call the request handler from controller
    handlers.push(handler);

    this.app[httpMethod](apiRoute, handlers);
  }
}

export const apiRegistryService = new ApiRegistryService();
