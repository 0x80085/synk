import * as morgan from 'morgan';
import * as compression from 'compression';
import helmet from 'helmet'
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';

export function configureExpressServer(app: NestExpressApplication) {
    // compression bc y not 
    app.use(compression());
    // avoid exposing webserver software
    app.disable('x-powered-by');
    // port forward by nginx
    app.enable('trust proxy');
    // remove sensitive header data
    app.use(helmet());
    // log all HTTP req info for debug
    app.use(morgan('short'));
}
