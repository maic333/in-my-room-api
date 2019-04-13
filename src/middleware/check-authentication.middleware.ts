import { NextFunction } from 'express';
import ApiRequest from '../types/api-request';
import ApiResponse from '../types/api-response';

export = () => (req: ApiRequest, res: ApiResponse, next: NextFunction) => {
  // check if user is authenticated
  if (req.session.user) {
    return next();
  }

  res
    .status(401)
    .send();
};
