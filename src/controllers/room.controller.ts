import ApiRequest from 'api-request.ts';
import ApiRoute from '../decorators/api-route';
import { ApiHttpMethod } from '../types/api-http-method';
import ApiResponse from '../types/api-response';
import { roomService } from '../services/room.service';
import { userService } from '../services/user.service';

class RoomController {
  @ApiRoute('rooms', ApiHttpMethod.GET, {checkAuth: true})
  getRooms(req: ApiRequest, res: ApiResponse) {
    const rooms = roomService.getRooms(req.session.user.id);

    res.json(rooms);
  }

  @ApiRoute('rooms', ApiHttpMethod.POST, {checkAuth: true})
  createRoom(req: ApiRequest, res: ApiResponse) {
    // create new room
    const newRoom = roomService.createRoom({
      name: req.body.name,
      ownerId: req.session.user.id
    });

    // add room to user
    const user = req.session.user;
    user.roomsIds.push(newRoom.id);
    userService.saveUser(user);

    res.json(newRoom);
  }

  @ApiRoute('rooms/:roomId', ApiHttpMethod.GET, {checkAuth: true})
  getRoom(req: ApiRequest, res: ApiResponse) {
    try {
      const room = roomService.getRoomForUser(req.session.user.id, req.params.roomId);
      res.json(room);
    } catch (e) {
      const statusCode = e.statusCode || 500;
      res
        .status(statusCode)
        .send(e.toString());
    }

  }

  @ApiRoute('rooms/:roomId/join', ApiHttpMethod.POST, {checkAuth: true})
  joinRoom(req: ApiRequest, res: ApiResponse) {
    try {
      roomService.joinRoom(req.session.user.id, req.params.roomId);

      res
        .status(204)
        .send();
    } catch (e) {
      res
        .status(404)
        .send();
    }
  }
}

export const roomController = new RoomController();
