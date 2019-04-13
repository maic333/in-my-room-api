import ApiRequest from 'api-request.ts';
import { userService } from '../services/user.service';
import ApiRoute from '../decorators/api-route';
import { ApiHttpMethod } from '../types/api-http-method';
import ApiResponse from '../types/api-response';
import { sign } from 'jsonwebtoken';

class AuthController {
  @ApiRoute('login', ApiHttpMethod.POST)
  login(req: ApiRequest, res: ApiResponse) {
    // create user
    const newUser = userService.createUser({
      name: req.body.name
    });

    // generate jwt token
    sign({userId: newUser.id}, process.env.JWT_KEY, (err, jwtToken) => {
      if (err) {
        return res
          .status(500)
          .send(err);
      }

      res.json({
        user: newUser,
        accessToken: jwtToken
      });
    });
  }
}

export const authController = new AuthController();
