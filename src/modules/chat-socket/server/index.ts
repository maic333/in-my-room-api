import * as WebSocket from 'ws';
import { ChatEvent } from '../types/chat-event';
import { ChatEventType } from '../types/chat-event-type';
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
        try {
          const event: ChatEvent = JSON.parse(message);
          switch (event.type) {
            case ChatEventType.CLIENT_AUTH_REQUEST:
              this.authenticateClient(ws, event.body);
              break;
          }
        } catch (err) {}
      });
    });
  }

  /**
   * Authenticate client
   */
  private authenticateClient(ws: WebSocket, payload: any): void {
    // get authentication result
    const authClientResult = this.config.authenticateClient(payload);

    // authenticate client
    if ((authClientResult as Promise<any>).then) {
      //  it is a Promise
      (authClientResult as Promise<UserT>)
        .then((user: UserT) => {
          this.clientUserMap.set(ws, user);
        })
        .catch((err) => {
          // #TODO send back error
        });
    } else {
      // it is a simple function
      if (authClientResult) {
        this.clientUserMap.set(ws, authClientResult as UserT);
      } else {
        // #TODO send back error
      }
    }
  }
}
