import { Response } from 'express-serve-static-core';
import { Logger } from '../tools/logger';
import { NextFunction } from 'express';

export class ErrorMeow extends Error {
  statusCode: number;
  constructor(statusCode: number, message: any) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const errorMeow = (err: any, res: Response, logger: Logger, next: NextFunction) => {
  const { statusCode, message } = err;

  if (statusCode === 500 || !statusCode) {
    const m = ` ฅ^•ﻌ•^ฅ < Error!! ${err ? err.statusCode : 'no status'} ${err ? err.message : 'no message'} `;
    logger.info(m);
  }

  const msg = {
    code: 'error',
    statusCode,
    message: message || 'oh oh ... ฅ^*ﻌ*^ฅ'
  };
  next(msg);
  res.status(500).json(msg);
};
