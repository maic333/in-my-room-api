import { ServerOptions } from 'ws';
import { ChatServer } from './server';

export default {
  /**
   * Create a chat server over Websocket
   */
  createServer: (config: ServerOptions): ChatServer => {
    return new ChatServer(config);
  },

  /**
   * Create client for a chat server over Websocket
   */
  createClient: (config) => {

  }
};
