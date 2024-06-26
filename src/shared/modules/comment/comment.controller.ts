import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/index.js';
import { Component, HttpMethod } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { CommentRdo, CommentService, CreateCommentDto } from './index.js';
import { fillDTO } from '../../helpers/index.js';
import { PrivateRouteMiddleware, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../libs/rest/middleware/index.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService
  ) {
    super(logger);
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new PrivateRouteMiddleware(), new ValidateDtoMiddleware(CreateCommentDto)]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new ValidateObjectIdMiddleware('offerId')]
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const comments = await this.commentService.findAllByOfferId(req.params.offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create({body, tokenPayload}: Request<Record<string, unknown>, Record<string, unknown>, CreateCommentDto>, res: Response): Promise<void> {
    const comment = await this.commentService.create({...body, userId: tokenPayload.id});
    this.created(res, fillDTO(CommentRdo, comment));
  }
}
