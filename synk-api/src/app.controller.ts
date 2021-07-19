import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './admin/guards/admin.guard';

import { AppConfig, AppConfigInput, AppService } from './app.service';

@ApiTags('Server Instance')
@Controller()
export class AppController {
  constructor(private appService: AppService) { }

  @Get()
  getGreeting(): string {
    return this.appService.defaultGreeting();
  }

  @Get('/config')
  @UseGuards(AdminGuard)
  getConfig(): AppConfig {
    return this.appService.getConfig();
  }

  @Patch('/config')
  @UseGuards(AdminGuard)
  patchConfig(@Body() config: AppConfigInput): AppConfig {
    return this.appService.patchConfig(config);
  }

  @UseGuards(AdminGuard)
  @Get('/sys')
  getSystemInfo(): any {
    return this.appService.getSysInfo();
  }

  @Get('/version')
  getVersion(): any {
    return { version: this.appService.getVersion() };
  }

}
