import User from './user';

export interface RoomChatMessage {
  user: User;
  message: string;
  datetime: string;
}

export enum ChatMessageType {
  CLIENT_MESSAGE = 'client-message',
  SERVER_MESSAGE = 'server-message',
  CHAT_HISTORY = 'chat-history'
}

export interface ClientMessage {
  type: ChatMessageType.CLIENT_MESSAGE;
  message: string;
}

export interface ServerMessage {
  type: ChatMessageType.SERVER_MESSAGE;
  message: RoomChatMessage;
}

export interface ChatHistoryMessage {
  type: ChatMessageType.CHAT_HISTORY;
  messages: RoomChatMessage[];
}
