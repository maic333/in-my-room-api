export interface ClientAuthenticationResponse<UserT> {
  // send response back to the client
  send: (user: UserT) => void;
  // send error back to the client
  error: (error: any) => void;
}

export interface ClientResponse {
  // send response back to the client
  send: (message: any) => void;
  // send error back to the client
  error: (error: any) => void;
}
