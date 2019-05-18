import { SocketMessage, SocketMessageType } from './types/socket-message';
import { v4 as uuid } from 'uuid';
import { PromiseExecutor } from './types/promise-executor';

interface IClientT {
  // send a message
  send: (message: string) => any;
}

/**
 * Abstract client used to perform Request-Response communication over any type of connection
 */
export class RRClient<ClientT extends IClientT> {
  // map each request to a Promise (each request is identified by a unique Transaction ID)
  private requestPromiseMap = new Map<string, PromiseExecutor<string>>();
  // map each request to corresponding timeout identifier
  private requestTimeoutMap = new Map<string, number>();
  // request timeout (in ms); defaults to 5 seconds
  private requestTimeout: number = 5000;

  constructor(requestTimeout?: number) {
    this.requestTimeout = requestTimeout || this.requestTimeout;
  }

  /**
   * TO BE OVERWRITTEN
   * Handle a received message. By default, always respond with an ACK
   */
  public handleMessage(message: string, executor: PromiseExecutor<string>): void {
    executor.resolve('OK');
  }

  /**
   * Send a message to a client
   */
  public sendMessage(client: ClientT, message: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // generate a new Transaction ID
      const transactionId = uuid();

      // create message in proper format
      const socketMessage: SocketMessage = {
        transactionId,
        type: SocketMessageType.NEW_MESSAGE,
        payload: message
      };

      // send the JSON stringified message
      client.send(JSON.stringify(socketMessage));

      // resolve/reject the Promise when we get the response (see 'receiveMessage' method)
      this.requestPromiseMap.set(transactionId, {resolve, reject});

      // check for timeout
      const timeoutID: number = setTimeout(() => {
        // request timeout reached
        // reject Promise
        reject('Timeout');

        // remove Promise from the map
        this.requestPromiseMap.delete(transactionId);
        // remove timeout from the map
        this.requestTimeoutMap.delete(transactionId);
      }, this.requestTimeout) as any;

      // keep a reference to this timeout so it can be removed when receiving the response
      this.requestTimeoutMap.set(transactionId, timeoutID);
    });
  }

  /**
   * Handle a message received from a client
   */
  public receiveMessage(client: ClientT, message: string): void {
    try {
      // convert message to the expected format
      const socketMessage: SocketMessage = JSON.parse(message);

      switch (socketMessage.type) {
        case SocketMessageType.NEW_MESSAGE: {
          // got a new message
          // get the response
          const responsePromise = new Promise<string>((resolve, reject) => {
            this.handleMessage(socketMessage.payload, {resolve, reject});
          });

          responsePromise
            .then((res: string) => {
              // send back a success response
              const successResponse: SocketMessage = {
                transactionId: socketMessage.transactionId,
                type: SocketMessageType.MESSAGE_OK,
                payload: res
              };

              client.send(JSON.stringify(successResponse));
            })
            .catch((err: string) => {
              // send back an error response
              const successResponse: SocketMessage = {
                transactionId: socketMessage.transactionId,
                type: SocketMessageType.MESSAGE_NOK,
                payload: err
              };

              client.send(JSON.stringify(successResponse));
            });
          break;
        }

        case SocketMessageType.MESSAGE_OK: {
          // got a success response
          // remove the corresponding timeout event
          const timeoutId = this.requestTimeoutMap.get(socketMessage.transactionId);
          clearTimeout(timeoutId);
          // remove timeout from the map
          this.requestTimeoutMap.delete(socketMessage.transactionId);

          const promiseExecutor = this.requestPromiseMap.get(socketMessage.transactionId);
          if (promiseExecutor) {
            // resolve the Promise
            promiseExecutor.resolve(socketMessage.payload);
            // remove Promise from the map
            this.requestPromiseMap.delete(socketMessage.transactionId);
          } else {
            // ignore unexpected message
          }
          break;
        }

        case SocketMessageType.MESSAGE_NOK: {
          // got an error response
          // remove the corresponding timeout event
          const timeoutId = this.requestTimeoutMap.get(socketMessage.transactionId);
          clearTimeout(timeoutId);
          // remove timeout from the map
          this.requestTimeoutMap.delete(socketMessage.transactionId);

          const promiseExecutor = this.requestPromiseMap.get(socketMessage.transactionId);
          if (promiseExecutor) {
            // reject the Promise
            promiseExecutor.reject(socketMessage.payload);
            // remove Promise from the map
            this.requestPromiseMap.delete(socketMessage.transactionId);
          } else {
            // ignore unexpected message
          }
          break;
        }

        default: {
          // ignore unexpected message
        }
      }
    } catch (err) {
      // ignore wrongly formatted messages
    }
  }
}
