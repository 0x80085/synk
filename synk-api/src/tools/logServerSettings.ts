import { Logger } from './logger';

export function logServerSettings(loggr: Logger) {
  loggr.info(`🚀 \t SERVER LAUNCHED \t 🚀`);

  const displayedServerSettings = [
    'NODE_ENV',
    'HOST_PORT',
    'CORS_ALLOWED_ORIGIN',
    'DOMAIN_NAME',
    'DOMAIN_NAME',
    'SESSION_SECRET',
    'SESSION_COOKIE_MAXAGE',
    'SSL_CERT_PATH',
    'SSL_KEY_PATH',
    'SSL_CHAIN_PATH',
    'TYPEORM_HOST',
    'TYPEORM_PORT',
  ];
  const displayedServerFlags = [
    'CORS_USE_CREDENTIAL',
    'SESSION_SAVEUNINITIALIZED',
    'SESSION_RESAVE',
    'SESSION_HTTPS',
    'TYPEORM_LOGGING',
  ];

  const envSettings = Object.keys(process.env)
    .filter(key => displayedServerSettings.indexOf(key) !== -1)
    .map(key => (`${key}::${process.env[key]}`));

  const envFlags = Object.keys(process.env)
    .filter(key => displayedServerFlags.indexOf(key) !== -1)
    .map(key => `${key}::${process.env[key] === 'TRUE'}`);

  loggr.info(`🛰 \t Started on port ${process.env.HOST_PORT} \t 🛰`);

  loggr.info('');
  loggr.info('Server Settings:');
  loggr.info('######################');
  loggr.info(`logger is set to debug mode::${loggr.isDebugMode}`);

  envSettings.forEach(setting => {
    loggr.info(`${setting}`);
  });

  envFlags.forEach(setting => {
    loggr.info(`${setting}`);
  });
  loggr.info('######################');
}
