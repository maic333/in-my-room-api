import User from './user';

export default interface Room {
  id?: string;
  name: string;
  ownerId: string;
  owner?: User;
  participantsIds?: string[];
  participants?: User[];
}
