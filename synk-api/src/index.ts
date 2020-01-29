import configure from './startup';
import { Logger } from './tools/logger';

const isProduction = process.env.NODE_ENV === 'production';
const logger = new Logger('logs', 'synk-api', !isProduction);

async function RUN() {

  logger.info(`Configuring API for ${isProduction ? 'PRD' : 'DEV'} environment...`);

  const { wsHttp } = await configure(logger);

  logger.info('Configuring COMPLETED!');

  logger.info('Launching server...');

  wsHttp.listen(3000, () => {
    logger.info(`\t SERVER LAUNCHED`);
    logger.info(`\t Started on port ${process.env.HOST_PORT}`);
  });
}

RUN()
  .catch(err => {
    logger.error(`\t SERVER CRASHED`);
    logger.error(err);
  })
  .finally(() => {
    logger.fatal('Server has ended execution. See log for errors if any.');
  });
