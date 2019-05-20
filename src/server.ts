import * as http from 'http';
import app from './app';
import { ChatServer } from './modules/chat-server';

// Create Express server
const server = http.createServer(app);

/**
 * Start Express server.
 */
server.listen(app.get('port'), () => {
  // create the Chat server
  const chatServer = new ChatServer({
    options: {
      server
    },
  });

  console.log(
    'App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
  console.log('Press CTRL-C to stop\n');
});

export default server;
