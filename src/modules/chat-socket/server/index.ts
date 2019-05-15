import * as WebSocket from 'ws';
import { ChatEvent, ChatEventType } from '../types/chat-event';
import { ChatServerConfig } from '../types/chat-server-config';

export class ChatServer<UserT extends Object> {
  // server configuration object
  private config: ChatServerConfig<UserT>;
  // Websocket server
  private wss: WebSocket.Server;
  // map each Websocket client to a user
  private clientUserMap = new WeakMap<WebSocket, UserT>();
  // map each user to a Websocket client
  private userClientMap = new WeakMap<UserT, WebSocket>();

  constructor(config: ChatServerConfig<UserT>) {
    this.config = config;
    this.wss = new WebSocket.Server(config.options);

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        this.handleClientMessage(ws, message);
      });
    });
  }

  /**
   * Handle a client message received through the Websocket channel
   */
  private handleClientMessage(ws: WebSocket, message: string): void {
    try {
      const event: ChatEvent = JSON.parse(message);
      switch (event.type) {
        case ChatEventType.CLIENT_AUTH_REQUEST:
          this.authenticateClient(ws, event);
          break;

        case ChatEventType.CLIENT_MESSAGE:
          this.receiveClientMessage(ws, event);
          break;

        default:
          // drop unrecognized message
          break;
      }
    } catch (err) {
      // drop wrongly formatted messages
    }
  }

  /**
   * Handle a chat message received from a client
   */
  private receiveClientMessage(ws: WebSocket, event: ChatEvent): void {
    if (!this.config.onClientMessage) {
      // client message handler not configured, return success
      return this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_SUCCESS, null, event);
    }

    // get handler result
    const clientMessageResult = this.config.onClientMessage(event.body);

    if (!(clientMessageResult as Promise<boolean>).then) {
      // handler is not a Promise
      throw new Error(`Method 'onClientMessage' must return a Promise.`);
    }

    // call Promise handler
    (clientMessageResult as Promise<any>)
      .then((result: any) => {
        this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_SUCCESS, result, event);
      })
      .catch((err) => {
        this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_ERROR, err, event);
      });
  }

  /**
   * Authenticate client
   */
  private authenticateClient(ws: WebSocket, event: ChatEvent): void {
    if (!this.config.onClientAuthentication) {
      // client authentication handler not configured
      throw new Error(`Method 'onClientAuthentication' is not configured.`);
    }

    // get authentication handler result
    const authClientResult = this.config.onClientAuthentication(event.body);

    if (!(authClientResult as Promise<UserT>).then) {
      // handler is not a Promise
      throw new Error(`Method 'onClientAuthentication' must return a Promise.`);
    }

    // call Promise handler
    (authClientResult as Promise<UserT>)
      .then((user: UserT) => {
        this.clientUserMap.set(ws, user);

        this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_SUCCESS, null, event);
      })
      .catch((err) => {
        this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_ERROR, err, event);
      });
  }

  /**
   * Send a formatted response to the client
   */
  private sendClientResponse(ws: WebSocket, eventType: ChatEventType, body: any, originalEvent: ChatEvent): void {
    const res: ChatEvent = {
      type: eventType,
      body: body,
      transactionId: originalEvent.transactionId
    };

    ws.send(JSON.stringify(res));
  }

  /**
   * Map a user to a Websocket client
   */
  private mapUserClient(user: UserT, ws: WebSocket): void {
    this.clientUserMap.set(ws, user);
    this.userClientMap.set(user, ws);
  }

  /**
   * Remove a client and the corresponding user from the maps
   */
  private disconnectClient(ws: WebSocket): void {
    // get corresponding user
    const user: UserT = this.clientUserMap.get(ws);
    // remove client from the map
    this.clientUserMap.delete(ws);

    const currentWs = this.userClientMap.get(user);
    if (currentWs === ws) {
      // remove user from the map
      this.userClientMap.delete(user);
    }
  }
}
