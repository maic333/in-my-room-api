export default interface Room<UserT> {
  id: string;
  name: string;
  owner: UserT;
}
