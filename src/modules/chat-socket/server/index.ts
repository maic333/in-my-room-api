import * as WebSocket from 'ws';
import { ChatEvent, ChatEventType } from '../types/chat-event';
import { ChatServerConfig } from '../types/chat-server-config';
import Room from '../types/room';

export class ChatServer<UserT extends Object> {
  // server configuration object
  private config: ChatServerConfig<UserT>;
  // Websocket server
  private wss: WebSocket.Server;
  // map each Websocket client to a user
  private clientUserMap = new WeakMap<WebSocket, UserT>();

  // #TODO below
  // list of rooms
  private rooms: Room<UserT>[] = [];
  // list of participants for each room
  private roomClients = new WeakMap<Room<UserT>, WebSocket[]>();
  // list of rooms for each user
  private userRooms = new WeakMap<UserT, Room<UserT>[]>();

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
      }
    } catch (err) {
      // drop wrongly formatted messages
    }
  }

  /**
   * Authenticate client
   */
  private authenticateClient(ws: WebSocket, event: ChatEvent): void {
    // get authentication result
    const authClientResult = this.config.authenticateClient(event.body);

    // authenticate client
    if ((authClientResult as Promise<any>).then) {
      //  it is a Promise
      (authClientResult as Promise<UserT>)
        .then((user: UserT) => {
          this.clientUserMap.set(ws, user);

          this.sendClientResponse(ws, ChatEventType.CLIENT_AUTH_SUCCESS, null, event);
        })
        .catch((err) => {
          this.sendClientResponse(ws, ChatEventType.CLIENT_AUTH_ERROR, null, event);
        });
    } else {
      // it is a simple function
      if (authClientResult) {
        this.clientUserMap.set(ws, authClientResult as UserT);

        this.sendClientResponse(ws, ChatEventType.CLIENT_AUTH_SUCCESS, null, event);
      } else {
        this.sendClientResponse(ws, ChatEventType.CLIENT_AUTH_ERROR, null, event);
      }
    }
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
}
