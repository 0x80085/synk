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

  private initLogFile(folder: string, fileName: string) {
    const targetFolder = path.join(process.cwd(), folder);
    const targetFile = path.join(process.cwd(), folder, fileName);

    if (!fs.existsSync(targetFile)) {
      const now = new Date().toISOString();
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
      }
      fs.writeFileSync(targetFile, `[${now}] _INFO_ :: Logger Launched`);
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