export enum ChatEventType {
  /**
   * Client to Server
   */
  // authentication request sent from client to server
  CLIENT_AUTH_REQUEST = 'CLIENT_AUTH_REQUEST',
  // chat message sent from client to server
  CLIENT_MESSAGE = 'CLIENT_MESSAGE',

  /**
   * Server to Client
   */
  CLIENT_AUTH_ERROR = 'CLIENT_AUTH_ERROR',
  // chat message sent from server to client(s) (usually via broadcast)
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  // chat history sent from server to client
  CHAT_HISTORY = 'CHAT_HISTORY',
  // message sent from server to client(s) to inform about a new participant (usually via broadcast)
  NEW_PARTICIPANT = 'NEW_PARTICIPANT',
  // message sent from server to client(s) to inform about a leaving participant (usually via broadcast)
  LEAVING_PARTICIPANT = 'LEAVING_PARTICIPANT'
}
