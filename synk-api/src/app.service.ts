import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'graceful-fs';
import { join } from 'path';
import { cwd } from 'process';
import { Repository } from 'typeorm';
import { GlobalSettings, GLOBAL_SETTINGS_NAME } from './domain/entity';

@Injectable()
export class AppService {
  globalSettings: GlobalSettings = null;

  version: string;

  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(GlobalSettings)
    private readonly settingsRepository: Repository<GlobalSettings>,
  ) {
    this.version = this.readVersionFromPackageJson();
    this.logger.log(`🚀 Starting Synk (version: ${this.version})`);

    this.logger.log(`Loading Global Settings..`);
    settingsRepository
      .findOne({ where: { name: GLOBAL_SETTINGS_NAME } })
      .then((it) => {
        this.logger.log('Fetched Global settings from DB');
        if (it === null) {
          const newSettings = this.settingsRepository.create({ name: GLOBAL_SETTINGS_NAME });
          this.globalSettings = it;
          return this.settingsRepository.save(newSettings);
        }
        this.globalSettings = it;
      })
      .catch((err) =>
        this.logger.warn('Could not fetch Global Settings from DB...', err),
      );
  }

  private readVersionFromPackageJson() {
    const pkgJsonPath = join(cwd(), 'package.json');
    const pkgJsonContent = readFileSync(pkgJsonPath, 'utf8');
    return JSON.parse(pkgJsonContent).version;
  }

  defaultGreeting(): string {
    return `
    Welcome to Synk.
    `;
  }

  getVersion() {
    return this.version;
  }
}
