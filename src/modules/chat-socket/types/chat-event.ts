import { ChatEventType } from './chat-event-type';

export interface ChatEvent {
  type: ChatEventType;
  body: any;
}
