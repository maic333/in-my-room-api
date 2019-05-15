import { ServerOptions } from 'ws';

export interface ChatServerConfig<UserT> {
  // options for creating the Websocket server
  options: ServerOptions;
  // client authentication handler
  onClientAuthentication: (payload: any) => Promise<UserT>;
  // client message handler
  onClientMessage?: (payload: any) => Promise<any>;
}
