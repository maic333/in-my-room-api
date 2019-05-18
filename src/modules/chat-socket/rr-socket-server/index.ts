import * as WebSocket from 'ws';
import { RRClient } from '../rr-client';
import { RRSocketServerConfig } from './types/rr-socket-server-config';
import { PromiseExecutor } from '../rr-client/types/promise-executor';

/**
 * WebSocket server that performs Request-Response communication with clients
 */
export class RRSocketServer {
  // WebSocket server
  private wss: WebSocket.Server;
  // Request-Response client
  private rrClient: RRClient<WebSocket>;

  constructor(config: RRSocketServerConfig) {
    // create the RR Client
    this.rrClient = new RRClient<WebSocket>(config.requestTimeout);

    // overwrite the default message handler of the RR Client
    this.rrClient.handleMessage = this.handleMessage;

    // create the WebSocket server
    this.wss = new WebSocket.Server(config.options);

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        // configure the RR client to handle the messages received over the WebSocket connection
        this.rrClient.receiveMessage(ws, message);
      });
    });

    this.wss.on('error', (error) => {
      // #TODO
    });
  }

  /**
   * TO BE OVERWRITTEN
   * Handle a received message. By default, always respond with an ACK
   */
  public handleMessage(message: string, executor: PromiseExecutor<string>) {
    executor.resolve('OK');
  }

  /**
   * Send a message to a WebSocket client
   */
  public sendMessage(client: WebSocket, message: string): Promise<string> {
    // send messages through the RR Client
    return this.rrClient.sendMessage(client, message);
  }
}
