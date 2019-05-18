export enum SocketMessageType {
  // new message emitted by a client
  NEW_MESSAGE = 'NEW_MESSAGE',
  // success response for a previously emitted message
  MESSAGE_OK = 'MESSAGE_OK',
  // error response for a previously emitted message
  MESSAGE_NOK = 'MESSAGE_NOK'
}

export class SocketMessage {
  // unique ID to identify request-response messages
  transactionId: string;
  // message type
  type: SocketMessageType;
  // message payload
  payload: string;
}
