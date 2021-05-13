import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { freemem, totalmem, loadavg } from 'os';
import { cpuUsage } from './util/sys-info';

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
    reservedUserNames: ['admin', 'administrator']
  };

  defaultGreeting(): string {
    return `
    Welcome to Chink TeeVee
    ==
    Access the JSON openapi at <host>:<port>/api-json
    Access the swagger user friendly api explorer at <host>:<port>/api
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
}
