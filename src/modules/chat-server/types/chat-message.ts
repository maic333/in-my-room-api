export enum ChatMessageType {
  /**
   * Client to Server
   */
  // client authentication request
  AUTH_REQUEST = 'AUTH_REQUEST',
  // client message on the chat, in a room
  CHAT_ROOM_MESSAGE = 'CHAT_MESSAGE',

  /**
   * Server to Client
   */
  // new chat message received in a room (usually sent via broadcast to all users in a room)
  NEW_MESSAGE_IN_ROOM = 'NEW_MESSAGE_IN_ROOM',
  // room's chat history (usually sent to a user that has just joined a room)
  ROOM_CHAT_HISTORY = 'CHAT_HISTORY',
  // inform room participants about a new user that has just joined (usually sent via broadcast to all users in a room)
  NEW_ROOM_PARTICIPANT = 'NEW_ROOM_PARTICIPANT',
  // inform room participants about a user that has just left (usually sent via broadcast to all users in a room)
  PARTICIPANT_LEFT_ROOM = 'PARTICIPANT_LEFT_ROOM'
}

/**
 * Message exchanged between chat client and server
 */
export interface ChatMessage {
  type: ChatMessageType;
  body: any;
}
