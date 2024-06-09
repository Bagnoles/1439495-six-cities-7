import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { StatusCodes } from 'http-status-codes';
import { createSecretKey } from 'node:crypto';
import { Middleware } from './index.js';
import { HttpError } from '../errors/index.js';
import { TokenPayload } from '../../../modules/auth/index.js';

function isTokenPayload(payload: unknown): payload is TokenPayload {
  return (
    (typeof payload === 'object' && payload !== null) &&
    ('mail' in payload && typeof payload.mail === 'string') &&
    ('name' in payload && typeof payload.name === 'string') &&
    ('avatar' in payload && typeof payload.avatar === 'string') &&
    ('isPro' in payload && typeof payload.isPro === 'boolean') &&
    ('id' in payload && typeof payload.id === 'string')
  );
}

export class ParseTokenMiddleware implements Middleware {
  constructor(private readonly jwtSecret: string) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers?.authorization?.split(' ');
    if (!authorizationHeader) {
      return next();
    }

    const [, token] = authorizationHeader;
    
    const { payload } = await jwtVerify(token, createSecretKey(this.jwtSecret, 'utf-8'));

    if (isTokenPayload(payload)) {
      req.tokenPayload = { ...payload };
      return next();
    } 
    return next(new HttpError(
      StatusCodes.UNAUTHORIZED,
      'Invalid token',
      'AuthenticateMiddleware')
    );
  }
}
