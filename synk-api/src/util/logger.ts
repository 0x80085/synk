import * as bunyan from 'bunyan';
import * as fs from 'graceful-fs';
import * as path from 'path';
import { Logger as NestJsLogger } from '@nestjs/common';

export class Logger extends NestJsLogger {

  isDebugMode = false;
  private writer: bunyan;

  constructor(folderName: string, fileName: string, isDebugMode: boolean) {
    super();
    this.isDebugMode = isDebugMode;
    const pathToLog = this.createLogFile(folderName, fileName);

    this.start(pathToLog);
  }

  info(entry: any) {
    this.logToConsole('info', entry);
    this.writer.info(entry);
  }

  debug(entry: any) {
    this.logToConsole('debug', entry);
    this.writer.debug(entry);
  }

  error(entry: any) {
    this.logToConsole('error', entry);
    this.writer.error(entry);
  }

  fatal(entry: any) {
    this.logToConsole('fatal', entry);
    this.writer.fatal(entry);
  }

  private now = () => new Date().toISOString();

  private logToConsole(severity: string, entry: any) {
    if (this.isDebugMode) {
      const formattedMsg = `「${this.now()}」\t「${severity}」 :: ${entry}`;

      console.log(formattedMsg);

      if (severity === 'fatal' || severity === 'error') {
        console.log(entry);
      }
    }
  }

  private createLogFile(folder: string, fileName: string) {
    const { targetFile, targetFolder } = this.getAndCreateFilePath(folder, fileName);
    this.createLogfileIfNotExists(targetFile, targetFolder);

    return targetFile;
  }

  private getAndCreateFilePath(folder: string, fileName: string) {
    const targetFolder = path.join(process.cwd(), folder);
    const targetFile = path.join(process.cwd(), folder, fileName);

    return { targetFile, targetFolder };
  }

  private createLogfileIfNotExists(targetFile: string, targetFolder: string) {
    if (!fs.existsSync(targetFile)) {
      const now = new Date().toISOString();
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
      }
      const msg = `「${now}」 _INFO_ :: File created by Logger`;
      fs.writeFileSync(targetFile, msg);
    }
  }

  private start(pathTo: string) {
    const level = this.isDebugMode ? bunyan.DEBUG : bunyan.INFO;
    this.writer = bunyan.createLogger({
      name: 'synk-api',
      streams: [{
        type: 'rotating-file',
        path: pathTo,
        level,
        period: '1d',   // daily rotation
        count: 3        // keep 3 back copies
      }]
    });
  }

}
