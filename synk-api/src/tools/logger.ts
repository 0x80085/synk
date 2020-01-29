import * as bunyan from 'bunyan';
import * as fs from 'graceful-fs';
import * as path from 'path';

export class Logger {

  writer: bunyan;

  isDebugMode = false;

  constructor(folderName: string, fileName: string, isDebugMode: boolean) {
    this.isDebugMode = isDebugMode;
    const pathToLog = this.initLogFile(folderName, fileName);
    this.start(pathToLog);
  }

  info(entry: any) {
    this.debugInfo('info', entry);
    this.writer.info(entry);
  }

  debug(entry: any) {
    this.debugInfo('debug', entry);
    this.writer.debug(entry);
  }

  error(entry: any) {
    this.debugInfo('error', entry);
    this.writer.error(entry);
  }

  fatal(entry: any) {
    this.debugInfo('fatal', entry);
    this.writer.fatal(entry);
  }

  private now = () => new Date().toISOString();

  private debugInfo(severity: string, entry: any) {
    if (this.isDebugMode) {
      console.log(`[${this.now()}]\t[${severity}]\t:: ${entry}`);
    }
  }

  private initLogFile(folder: string, fileName: string) {
    const targetFolder = path.join(process.cwd(), folder);
    const targetFile = path.join(process.cwd(), folder, fileName);

    if (!fs.existsSync(targetFile)) {
      const now = new Date().toISOString();
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
      }
      fs.writeFileSync(targetFile, `[${now}] _INFO_ :: File created by Logger`);
    }

    return targetFile;
  }

  private start(pathTo: string) {
    const level = this.isDebugMode ? bunyan.INFO : bunyan.ERROR;
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
