import { storageService } from './storage.service';
import Room from '../types/room';
import v4 from 'uuid/v4';
import { ForbiddenError, ResourceNotFoundError } from '../types/errors';

class RoomService {
  createRoom(room: Room): Room {
    // generate ID
    room.id = v4();
    // add owner to the participants list
    room.participantsIds = [room.ownerId];

    // save room
    storageService.saveRoom(room);

    return room;
  }

  getRooms(userId: string): Room[] {
    // get user
    const user = storageService.getUser(userId);

    if (!user) {
      return [];
    }

    // return user's rooms
    return user.roomsIds
      .reduce((acc: Room[], roomId: string) => {
        // find room
        const room = storageService.getRoom(roomId);
        if (room) {
          acc.push(room);
        }
        return acc;
      }, []);
  }

  joinRoom(userId: string, roomId: string) {
    // get user
    const user = storageService.getUser(userId);
    // get room
    const room = storageService.getRoom(roomId);

    if (!user || !room) {
      throw new Error('Resource not found');
    }

    // add user to room
    if (room.participantsIds.indexOf(user.id) < 0) {
      room.participantsIds.push(user.id);

      // save room
      storageService.saveRoom(room);
    }

    // add room to user
    if (user.roomsIds.indexOf(room.id) < 0) {
      user.roomsIds.push(room.id);

      // save user
      storageService.saveUser(user);
    }
  }

  getRoomForUser(userId: string, roomId: string): Room {
    // get user
    const user = storageService.getUser(userId);
    // get room
    const room = storageService.getRoom(roomId);

    if (!user || !room) {
      throw new ResourceNotFoundError('Resource not found');
    }

    if (!this.roomHasParticipant(room, userId)) {
      throw new ForbiddenError('User is not a participant');
    }

    return room;
  }

  roomHasParticipant(room: Room, userId: string): boolean {
    return room && room.participantsIds.indexOf(userId) >= 0;
  }
}

export const roomService = new RoomService();
