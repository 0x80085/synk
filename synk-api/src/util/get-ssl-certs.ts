
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import * as fs from 'graceful-fs';
import { Logger } from './logger';

export function getSSLCert(logger: Logger): HttpsOptions {

    const pathToKey = process.env.SSL_KEY_PATH;
    const pathToCert = process.env.SSL_CERT_PATH;
    const pathToChain = process.env.SSL_CHAIN_PATH;

    try {

        if (!pathToKey || !pathToCert || !pathToChain) {
            throw new Error('WARN no path to SSL certificate found, SLL can not be used');
        }

        const privateKey = fs.readFileSync(pathToKey, 'utf8');
        const certificate = fs.readFileSync(pathToCert, 'utf8');
        const chain = fs.readFileSync(pathToChain, 'utf8');

        return {
            key: privateKey,
            cert: certificate,
            ca: [chain]
        };

    } catch (e) {
        logger.info(`getSSLCert failed to find SLL certificates`);
        logger.info(e);
        logger.info(`no file at ${pathToKey}`);
        logger.info(`no file at ${pathToCert}`);
        logger.info('no cert found, resuming');
        return null;
    }
}