import User from '../types/user';
import { storageService } from './storage.service';
import v4 from 'uuid/v4';

class UserService {
  createUser(user: User): User {
    // generate ID
    user.id = v4();
    user.roomsIds = [];

    // create user
    storageService.saveUser(user);

    return user;
  }

  getUser(userId: string): User {
    return storageService.getUser(userId);
  }

  saveUser(user: User) {
    storageService.saveUser(user);
  }
}

export const userService = new UserService();
