export default interface Room {
  id?: string;
  name: string;
  ownerId: string;
  participantsIds?: string[];
}
