import * as WebSocket from 'ws';
import { ChatEvent, ChatEventType } from '../chat-types/chat-event';
import { ChatServerConfig } from '../chat-types/chat-server-config';

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

  public sendMessage(user: UserT, message: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {

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
    // check if client is authenticated
    const user: UserT = this.clientUserMap.get(ws);

    if (!user) {
      // client is not authenticated; return error
      return this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_ERROR, 'Unauthorized', event);
    }

    if (!this.config.onClientMessage) {
      // client message handler not configured; return success
      return this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_SUCCESS, null, event);
    }

    // call external handler
    this.config.onClientMessage(
      {
        message: event.body,
        user
      },
      {
        send: (message: any) => {
          this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_SUCCESS, message, event);
        },
        error: (error: any) => {
          this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_ERROR, error, event);
        }
      }
    );
  }

  /**
   * Authenticate client
   */
  private authenticateClient(ws: WebSocket, event: ChatEvent): void {
    // call the authentication handler
    this.config.onClientAuthentication(
      {message: event.body},
      {
        send: (user: UserT) => {
          this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_SUCCESS, null, event);
        },
        error: (error: any) => {
          this.sendClientResponse(ws, ChatEventType.CLIENT_REQUEST_ERROR, error, event);
        }
      }
    );
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
