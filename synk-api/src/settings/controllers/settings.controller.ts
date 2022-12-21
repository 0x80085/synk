import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GlobalSettingsService } from '../global-settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private globalSettingsService: GlobalSettingsService) {}

  @Get('/allowed-media-providers')
  @ApiOperation({ summary: 'Get allowed Media Hosting Providers' })
  async getAllwedMediaProviders(): Promise<string[]> {
    return this.globalSettingsService.allowedMediaHostingProviders;
  }
}
