export interface ClientAuthenticationRequest {
  message: any;
}

export interface ClientRequest<UserT> {
  message: any;
  user: UserT;
}
