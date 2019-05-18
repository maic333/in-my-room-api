import { ServerOptions } from 'ws';

export interface RRSocketServerConfig {
  // options for creating the Websocket server
  options: ServerOptions;
  // request timeout value
  requestTimeout?: number;
}
