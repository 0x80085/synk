import { logServerSettings } from './tools/logServerSettings';
import configure from './startup';
import { Logger } from './tools/logger';

async function RUN(loggr: Logger) {
  const isProduction = process.env.NODE_ENV === 'production';

  loggr.info(`Configuring API for ${isProduction ? 'PRD' : 'DEV'} environment...`);

  const { server } = await configure(loggr);

  loggr.info('Configuring COMPLETED!');

  loggr.info('Launching server...');

  server.listen(process.env.HOST_PORT, () => {
    logServerSettings(loggr);
  });
}

const logger = new Logger('logs', 'trace.log', process.env.NODE_ENV === 'production');

try {

  RUN(logger)
    .catch(err => {
      logger.error(`\t SERVER CRASHED`);
      logger.error(err);
    })
    .finally(() => {
      // logger.info('');
    });

} catch (error) {
  logger.fatal(error);
  logger.fatal('Server has ended execution. See above for errors if any.');
}
