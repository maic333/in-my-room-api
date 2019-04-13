import User from '../types/user';
import Room from '../types/room';

class StorageService {
  private users: { [userId: string]: User } = {};
  private rooms: { [roomId: string]: Room } = {};

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
  }

  deleteRoom(roomId: string) {
    delete this.rooms[roomId];
  }

  modifyRoom(room: Room) {
    this.rooms[room.id] = room;
  }
}

export const storageService = new StorageService();
