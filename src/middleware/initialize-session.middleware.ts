import { NextFunction } from 'express';
import ApiRequest from '../types/api-request';
import ApiResponse from '../types/api-response';

export = () => (req: ApiRequest, res: ApiResponse, next: NextFunction) => {
  req.session = {};
  next();
};
