import app from './app';
import { ChatServer } from './modules/chat-server';

/**
 * Start MaicJS server.
 */
const port: any = process.env.PORT || 3000;
app.listen(port)
  .then(() => {
    // create the Chat server
    const chatServer = new ChatServer({
      options: {
        port: 4011
      },
    });

    console.log(`App is running on http://localhost:${port}`);
    console.log('Press CTRL-C to stop\n');
  });

export default app;
