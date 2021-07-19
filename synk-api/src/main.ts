import * as dotenv from 'dotenv';

import { Logger } from './util/logger';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';
import { setupSwagger } from './util/setup-swagger';
import { configureServer } from './configure-server';

async function bootstrap() {

  dotenv.config();

  const logger = new Logger('logs', 'trace.log', process.env.NODE_ENV !== 'production');

  const { app, port }: { app: NestExpressApplication; port: number; } = await configureServer(logger);

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app, port);
  }

  // access the api export .json at `<host>:<port>/api-json`
  await app.listen(port);
}

bootstrap();
