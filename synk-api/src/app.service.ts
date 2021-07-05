import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { freemem, totalmem, loadavg } from 'os';
import { cpuUsage } from './util/sys-info';

import { readFileSync } from 'graceful-fs';
import { join } from 'path';

export interface AppConfig {
  maxRooms: number;
  maxUsers: number;
  maxUsersPerRoom: number;
  maxChannelsOwnedByUser: number;
  maxMessagesPerRoom: number,
  isRegistrationLocked: boolean;
  reservedUserNames: string[];
}

export class AppConfigInput implements AppConfig {
  @ApiProperty()
  maxRooms: number;

  @ApiProperty()
  maxUsers: number;

  @ApiProperty()
  maxUsersPerRoom: number;

  @ApiProperty()
  maxChannelsOwnedByUser: number;

  @ApiProperty()
  maxMessagesPerRoom: number;

  @ApiProperty()
  isRegistrationLocked: boolean;

  @ApiProperty()
  reservedUserNames: string[];
}
@Injectable()
export class AppService {

  config: AppConfig = {
    maxRooms: 200,
    maxUsers: 10000,
    maxUsersPerRoom: 400,
    maxMessagesPerRoom: 400,
    maxChannelsOwnedByUser: 4,
    isRegistrationLocked: false,
    reservedUserNames: ['admin', 'administrator', 'synk-admin']
  };

  version: string;

  constructor() {
    const pkgJsonPath = join(__dirname, 'package.json');
    const pkgJsonContent = readFileSync(pkgJsonPath, 'utf8');
    this.version = JSON.parse(pkgJsonContent).version;
  }

  defaultGreeting(): string {
    return `
    Welcome to Chink TeeVee
    ==
    `;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  patchConfig(config: AppConfig) {
    this.config = { ...this.config, ...config };
    return this.config;
  }

  getSysInfo() {
    const { uptime, config, features, memoryUsage } = process;

    return {
      vars: config.variables,
      cpuUsage: cpuUsage(),
      features: features,
      memUsage: {
        free: freemem(), total: totalmem(), avg: loadavg(), procUsage: memoryUsage()
      },
      uptime: uptime()
    }
  }

  getVersion() {
    return this.version;
  }
}
