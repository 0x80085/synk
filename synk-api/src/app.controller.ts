import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('Server Instance')
@Controller()
export class AppController {
  constructor(private appService: AppService) { }

  @Get()
  getGreeting(): string {
    return this.appService.defaultGreeting();
  }

  @Get('/version')
  getVersion(): any {
    return { version: this.appService.getVersion() };
  }

}
