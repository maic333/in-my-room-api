import * as WebSocket from 'ws';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../types/jwt-payload';
import { userService } from './user.service';
import User from '../types/user';
import Room from '../types/room';
import { roomService } from './room.service';
import {
  ChatHistoryMessage,
  ChatMessageType,
  ClientMessage, NewParticipantMessage,
  RoomChatMessage,
  ServerMessage
} from '../types/chat-service-message';
import { Server } from 'http';
import * as url from 'url';

class ChatService {
  roomClients: {[roomId: string]: WebSocket[]} = {};

  init(server: Server) {
    const wss = new WebSocket.Server({
      server,
      verifyClient: (info, cb) => {
        // get query params
        const queryData = url.parse(info.req.url, true).query;
        const token = queryData.token as string;
        const roomId = queryData.roomId as string;

        if (!token || !roomId) {
          return cb(false, 401, 'Unauthorized');
        }

        // Verify token
        verify(token, process.env.JWT_KEY, (err, payload: JwtPayload) => {
          if (err || !payload.userId) {
            return cb(false, 401, 'Unauthorized');
          }

          // get user with the given ID
          const user = userService.getUser(payload.userId);

          if (!user) {
            return cb(false, 401, 'Unauthorized');
          }

          try {
            // get room with the given ID
            const room = roomService.getRoomForUser(user.id, roomId);

            // save user on request
            (info.req as any).user = user;
            // save room on request
            (info.req as any).room = room;

            cb(true);
          } catch (e) {
            return cb(false, 401, 'Unauthorized');
          }
        });
      }
    });

    wss.on('connection', (ws: WebSocket, req) => {
      // new client connected
      const user: User = (req as any).user;
      const room: Room = (req as any).room;

      // send back room chat history
      const historyMessage: ChatHistoryMessage = {
        type: ChatMessageType.CHAT_HISTORY,
        messages: roomService.getRoomChatHistory(room.id)
      };
      ws.send(JSON.stringify(historyMessage));

      // save new client on room
      this.roomClients[room.id] = this.roomClients[room.id] || [];
      this.roomClients[room.id].push(ws);

      // inform the other room participants about the new client
      const newClientMessage: NewParticipantMessage = {
        type: ChatMessageType.NEW_PARTICIPANT,
        user
      };
      this.roomClients[room.id]
        // omit current user
        .filter((client) => ws !== client)
        .forEach((wsClient) => {
          wsClient.send(JSON.stringify(newClientMessage));
        });

      ws.on('message', (message: string) => {
        // new message received from client
        try {
          const messageObj = JSON.parse(message);

          if (messageObj.type === ChatMessageType.CLIENT_MESSAGE) {
            const clientMessage: ClientMessage = messageObj;

            // create chat message object
            const chatMessage: RoomChatMessage = {
              user,
              message: clientMessage.message,
              datetime: new Date().toISOString()
            };

            // broadcast message to room participants
            const serverMessage: ServerMessage = {
              type: ChatMessageType.SERVER_MESSAGE,
              message: chatMessage
            };
            this.roomClients[room.id]
              // omit current user
              .filter((client) => ws !== client)
              .forEach((wsClient) => {
                wsClient.send(JSON.stringify(serverMessage));
              });

            // update chat history
            roomService.addRoomChatMessage(room.id, chatMessage);
          }
        } catch (e) {
          // do nothing
        }
      });

      ws.on('close', () => {
        // remove client from room
        this.roomClients[room.id] = this.roomClients[room.id]
          .filter((client) => client !== ws);
      });
    });
  }

}

export const chatService = new ChatService();
