import * as http from 'http';
import app from './app';
import { chatService } from './services/chat.service';

// Create Express server
const server = http.createServer(app);

// Initialize the Chat service (Websocket)
chatService.init(server);

/**
 * Start Express server.
 */
server.listen(app.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});

export default server;
