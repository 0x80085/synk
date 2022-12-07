import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GlobalSettings } from 'src/domain/entity';

export const GLOBAL_SETTINGS_NAME = 'default'

export const defaultAllowedMediaHostingProviders = [
  'youtu.be',
  'youtube.com',
  'www.youtu.be',
  'www.youtube.com',

  'twitch.tv',
  'www.twitch.tv',

  'vimeo.com',
  'www.vimeo.com',

  'cdn.lbryplayer.xyz',
  'lbryplayer.xyz',

  'archive.org',


];

@Injectable()
export class GlobalSettingsService {

  get allowedMediaHostingProviders(): string[] {
    return JSON.parse(this.globalSettings.allowedMediaHostingProviders);
  }

  private globalSettings: GlobalSettings = null;

  private readonly logger = new Logger(GlobalSettingsService.name);

  constructor(
    @InjectRepository(GlobalSettings)
    private readonly settingsRepository: Repository<GlobalSettings>,
  ) {
    this.loadOrCreateGlobalSettings();
  }

  async getGlobalSettings() {
    if (this.globalSettings === null) {
      const [settings] = await this.settingsRepository.find({
        where: { name: GLOBAL_SETTINGS_NAME },
      });
      return settings;
    } else {
      return this.globalSettings;
    }
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

  private loadOrCreateGlobalSettings() {
    this.logger.log(`Loading Global Settings..`);
    this.settingsRepository
      .findOne({ where: { name: GLOBAL_SETTINGS_NAME } })
      .then((it) => {
        this.logger.log('Fetched Global settings from DB');
        if (it === null) {
          this.globalSettings = this.createDefaultSettings();
        } else {
          this.globalSettings = it;
        }
      })
      .catch((err) =>
        this.logger.warn('Could not fetch Global Settings from DB...', err),
      );
  }

  private createDefaultSettings() {
    const newSettings = this.settingsRepository.create({
      name: GLOBAL_SETTINGS_NAME,
      allowedMediaHostingProviders: JSON.stringify(defaultAllowedMediaHostingProviders),
      
    });
    this.settingsRepository.save(newSettings);
    return newSettings;
  }
}
