import { Response } from 'express';

export default interface ApiResponse extends Response {
  todo: boolean;
}
