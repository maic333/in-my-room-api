import { ServerOptions } from 'ws';
import { ClientAuthenticationRequest, ClientRequest } from './client-request';
import { ClientAuthenticationResponse, ClientResponse } from './client-response';

export interface ChatServerConfig<UserT> {
  // options for creating the Websocket server
  options: ServerOptions;
  // client authentication handler
  onClientAuthentication: (req: ClientAuthenticationRequest, res: ClientAuthenticationResponse<UserT>) => void;
  // client message handler
  onClientMessage?: (req: ClientRequest<UserT>, res: ClientResponse) => void;
}
