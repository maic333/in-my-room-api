import User from '../types/user';
import Room from '../types/room';
import { RoomChatMessage } from '../types/chat-service-message';

class StorageService {
  private users: { [userId: string]: User } = {};
  private rooms: { [roomId: string]: Room } = {};
  private roomChatHistory: { [roomId: string]: RoomChatMessage[] } = {};

  getUser(userId: string): User | undefined {
    return this.users[userId];
  }

  saveUser(user: User) {
    this.users[user.id] = user;
  }

  getRoom(roomId: string) {
    return this.rooms[roomId];
  }

  saveRoom(room: Room) {
    this.rooms[room.id] = room;

    // create chat history if necessary
    this.roomChatHistory[room.id] = this.roomChatHistory[room.id] || [];
  }

  deleteRoom(roomId: string) {
    delete this.rooms[roomId];
  }

  modifyRoom(room: Room) {
    this.rooms[room.id] = room;
  }

  getRoomChatHistory(roomId: string): RoomChatMessage[] {
    return this.roomChatHistory[roomId] || [];
  }

  addRoomChatMessage(roomId: string, message: RoomChatMessage) {
    this.roomChatHistory[roomId].push(message);
  }
}

export const storageService = new StorageService();
