import ApiRequest from './api-request';
import ApiResponse from './api-response';
import { NextFunction } from 'express';

export type ApiRequestHandler = (req: ApiRequest, res: ApiResponse, next: NextFunction) => any;