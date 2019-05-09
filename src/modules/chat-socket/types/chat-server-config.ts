import { ServerOptions } from 'ws';

export interface ChatServerConfig<UserT> {
  // options for creating the Websocket server
  options: ServerOptions;
  // client authentication handler
  authenticateClient: (payload: any) => null | UserT | Promise<UserT>;
}
