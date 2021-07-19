import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'socket.io';
import * as sharedsession from 'express-socket.io-session'

import { Logger } from '@nestjs/common';

/**
 * Enable session tokens for web sockets by using express-socket.io-session
 */
export class SessionIOAdapter extends IoAdapter {

  private sessionConfig;

  private readonly logger = new Logger(SessionIOAdapter.name);

  constructor(app: NestExpressApplication, sessionConfig: any) {
    super(app)
    this.sessionConfig = sessionConfig
  }

  createIOServer(port: number, options?: any): any {
    this.logger.log('creating custom IOServer with session support...');

    const server: Server = super.createIOServer(port, options);

    server.use(sharedsession(this.sessionConfig));

    return server;
  }
}