import { NextFunction } from 'express';
import ApiRequest from '../types/api-request';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../types/jwt-payload';
import { userService } from '../services/user.service';
import ApiResponse from '../types/api-response';

export = () => (req: ApiRequest, res: ApiResponse, next: NextFunction) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  // Get JWT token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  // Verify token
  verify(token, process.env.JWT_KEY, (err, payload: JwtPayload) => {
    if (err || !payload.userId) {
      return next();
    }

    // get user with the given ID
    const user = userService.getUser(payload.userId);

    if (!user) {
      return next();
    }

    // save user on request
    req.session.user = user;

    next();
  });
};
