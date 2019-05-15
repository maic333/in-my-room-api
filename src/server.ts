import * as http from 'http';
import app from './app';
import { ChatServer } from './modules/chat-socket/server';
import User from './types/user';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from './types/jwt-payload';
import { userService } from './services/user.service';

// Create Express server
const server = http.createServer(app);

/**
 * Start Express server.
 */
server.listen(app.get('port'), () => {
  // create the Chat server
  const chatServer = new ChatServer<User>({
    options: {
      server
    },
    onClientAuthentication: (reqPayload: { token: string }): Promise<User> => {
      return new Promise<User>((resolve, reject) => {
        // check jwt
        verify(reqPayload.token, process.env.JWT_KEY, (err, payload: JwtPayload) => {
          if (err || !payload.userId) {
            return reject();
          }

          // get user with the given ID
          const user = userService.getUser(payload.userId);

          if (!user) {
            return reject();
          }

          resolve(user);
        });
      });
    }
  });

  console.log(
    'App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
  console.log('Press CTRL-C to stop\n');
});

export default server;
