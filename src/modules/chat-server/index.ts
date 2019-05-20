import { ChatMessage, ChatMessageType } from './types/chat-message';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../../types/jwt-payload';
import { userService } from '../../services/user.service';
import User from '../../types/user';
import { WebsocketAgileServer } from 'websocket-agile-server/dist';
import { ServerConfig } from 'websocket-agile-server/dist/types/server-config';
import { PromiseExecutor } from 'websocket-agile-server/dist/types';

export class ChatServer {
  // WAS Server
  private was: WebsocketAgileServer;

  constructor(config: ServerConfig) {
    // initialize the WAS instance
    this.was = new WebsocketAgileServer(config);

    // register the message handler
    this.was.handleMessage = this.handleMessage;
  }

  /**
   * Send message to a client
   */
  public sendMessage(user: User, message: ChatMessage): Promise<string> {
    // #TODO get user's client
    const client = user as any;

    // send the message
    return this.was.sendMessage(client, JSON.stringify(message));
  }

  /**
   * Handle messages
   */
  private handleMessage(message: string, executor: PromiseExecutor<string>) {
    try {
      const chatMessage: ChatMessage = JSON.parse(message);
      const messageBody = chatMessage.body || {};

      switch (chatMessage.type) {
        case ChatMessageType.AUTH_REQUEST:
          if (!messageBody.token) {
            return executor.reject('Missing authentication token');
          }

          // check jwt
          verify(messageBody.token, process.env.JWT_KEY, (err, payload: JwtPayload) => {
            if (err || !payload.userId) {
              return executor.reject('Authentication failed');
            }

            // get user with the given ID
            const user = userService.getUser(payload.userId);

            if (!user) {
              return executor.reject('Authentication failed');
            }

            executor.resolve(JSON.stringify({user}));
          });
          break;

        case ChatMessageType.CHAT_ROOM_MESSAGE:
          // #TODO
          break;

        default:
          executor.reject('Unknown message type');
          break;
      }
    } catch (e) {
      executor.reject('Wrong message format');
    }
  }
}
