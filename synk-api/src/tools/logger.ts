import * as bunyan from 'bunyan';
import * as fs from 'graceful-fs';
import * as path from 'path';

export class Logger {

  writer: bunyan;

  isDebugMode = false;

  constructor(folderName: string, fileName: string, isDebugMode: boolean) {
    this.isDebugMode = isDebugMode;
    const pathToLog = path.join(process.cwd(), folderName, fileName);
    this.initLogFile(pathToLog);
    this.start(pathToLog);
  }

  info(msg: string) {
    this.writer.info(msg);
  }

  debug(msg: string) {
    this.writer.debug(msg);
  }

  error(msg: string) {
    this.writer.error(msg);
  }

  fatal(msg: string) {
    this.writer.fatal(msg);
  }

  private initLogFile(pathTo: string) {
    if (!fs.existsSync(pathTo)) {
      const now = new Date().toISOString();
      fs.writeFileSync(pathTo, `[${now}] _INFO_ :: Logger Launched`);
    }
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
