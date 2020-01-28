import { Response } from 'express-serve-static-core';

export class ErrorMeow extends Error {
  statusCode: number;
  constructor(statusCode: number, message: any) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const errorMeow = (err: any, res: Response) => {
  const { statusCode, message } = err;

  if (err.statusCode === 500 || !err.statusCode) {
    const msg = ` ฅ^•ﻌ•^ฅ < Error!! ${err ? err.statusCode : 'no status'} ${err ? err.message : 'no message'} `;
    console.log(msg);
  }

  res.status(statusCode).json({
    code: 'error',
    statusCode,
    message
  });
};
