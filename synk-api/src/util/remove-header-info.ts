
import { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/ban-types
export function removeHeaderInfo(req: Request, res: Response, next: Function) {
  res.removeHeader("X-Powered-By");
  res.removeHeader("x-powered-by");
  next();
};
