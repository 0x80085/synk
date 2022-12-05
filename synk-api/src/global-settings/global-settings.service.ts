import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { GlobalSettings, GLOBAL_SETTINGS_NAME } from 'src/domain/entity';
import { Repository } from 'typeorm';

@Injectable()
export class GlobalSettingsService {
  private globalSettings: GlobalSettings = null;

  private readonly logger = new Logger(GlobalSettingsService.name);

  constructor(
    @InjectRepository(GlobalSettings)
    private readonly settingsRepository: Repository<GlobalSettings>,
  ) {
    this.logger.log(`Loading Global Settings..`);
    settingsRepository
      .findOne({ where: { name: GLOBAL_SETTINGS_NAME } })
      .then((it) => {
        this.logger.log('Fetched Global settings from DB');
        if (it === null) {
          const newSettings = this.settingsRepository.create({
            name: GLOBAL_SETTINGS_NAME,
          });
          this.globalSettings = it;
          return this.settingsRepository.save(newSettings);
        }
        this.globalSettings = it;
      })
      .catch((err) =>
        this.logger.warn('Could not fetch Global Settings from DB...', err),
      );
  }

  async getGlobalSettings() {
    const [settings] = await this.settingsRepository.find({
      where: { name: GLOBAL_SETTINGS_NAME },
    });
    return settings;
  }

  async updateGlobalSettings(input: GlobalSettings) {
    const [settings] = await this.settingsRepository.find({
      where: { name: GLOBAL_SETTINGS_NAME },
    });
    if (settings) {
      await this.settingsRepository.update(settings, input);
    } else {
      const nuSettings = this.settingsRepository.create({
        ...input,
      });
      await this.settingsRepository.save(nuSettings);
    }
  }
}
