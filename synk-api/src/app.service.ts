import { Injectable, Logger } from '@nestjs/common';

import { readFileSync } from 'graceful-fs';
import { join } from 'path';
import { cwd } from 'process';

@Injectable()
export class AppService {
  version: string;

  private readonly logger = new Logger(AppService.name);

  constructor() {
    this.version = this.readVersionFromPackageJson();
    this.logger.log(`🚀 Starting Synk (version: ${this.version})`);
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
