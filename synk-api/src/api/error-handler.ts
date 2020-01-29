import { Response } from 'express-serve-static-core';
import { Logger } from '../tools/logger';

export class ErrorMeow extends Error {
  statusCode: number;
  constructor(statusCode: number, message: any) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const errorMeow = (err: any, res: Response, logger: Logger) => {
  const { statusCode, message } = err;

  if (statusCode === 500 || !statusCode) {
    const msg = ` ฅ^•ﻌ•^ฅ < Error!! ${err ? err.statusCode : 'no status'} ${err ? err.message : 'no message'} `;
    logger.info(msg);
  }

  res.status(statusCode || 500).json({
    code: 'error',
    statusCode,
    message
  });
};
