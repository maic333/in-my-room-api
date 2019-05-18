import { RRClient } from '../rr-client';
import { RRSocketClientConfig } from './types/rr-socket-client-config';
import { PromiseExecutor } from '../rr-client/types/promise-executor';

/**
 * WebSocket server that performs Request-Response communication with clients
 */
export class RRSocketClient {
  private clientConfig: RRSocketClientConfig;
  // WebSocket client
  private ws: WebSocket;
  // Request-Response client
  private rrClient: RRClient<WebSocket>;

  constructor(config: RRSocketClientConfig) {
    this.clientConfig = config;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // connect to the WebSocket server
      this.ws = new WebSocket(this.clientConfig.serverUrl);

      this.ws.onopen = () => {
        // connection established
        // create the RR Client
        this.rrClient = new RRClient<WebSocket>(this.clientConfig.requestTimeout);

        // overwrite the default message handler of the RR Client
        this.rrClient.handleMessage = this.handleMessage;

        resolve();
      };

      this.ws.onerror = (err) => {
        // connection failed
        reject(err);
      };

      // wait for messages from the server
      this.ws.onmessage = (event: MessageEvent) => {
        // configure the RR client to handle the messages received over the WebSocket connection
        this.rrClient.receiveMessage(this.ws, event.data);
      };
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
  public sendMessage(message: string): Promise<string> {
    // send messages through the RR Client
    return this.rrClient.sendMessage(this.ws, message);
  }
}
