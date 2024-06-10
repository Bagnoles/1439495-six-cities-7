import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/index.js';
import { City, Component, HttpMethod } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { CreateOfferDto, OfferRdo, OfferService, FullOfferRdo, UpdateOfferDto } from './index.js';
import { fillDTO } from '../../helpers/index.js';
import { DocumentExistsMiddleware, PrivateRouteMiddleware, ValidateDtoMiddleware, ValidateObjectIdMiddleware } from '../../libs/rest/middleware/index.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService
  ) {
    super(logger);
    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.getFullInfo,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.getPremium });
    this.addRoute({ path: '/favorite', method: HttpMethod.Get, handler: this.getFavorite, middlewares: [new PrivateRouteMiddleware()] });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Patch,
      handler: this.addToFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    let offers = [];
    if (req.tokenPayload.id) {
      offers = await this.offerService.findAllForUser(req.tokenPayload.id);
    } else {
      offers = await this.offerService.findAll();
    }
    this.ok(res, fillDTO(OfferRdo, offers));
  }

  public async create({body, tokenPayload}: Request<Record<string, unknown>, Record<string, unknown>, CreateOfferDto>, res: Response): Promise<void> {
    const result = await this.offerService.create({...body, userId: tokenPayload.id});
    this.created(res, fillDTO(FullOfferRdo, result));
  }

  public async getFullInfo(req: Request, res: Response): Promise<void> {
    const offer = await this.offerService.findById(req.params.offerId);
    this.ok(res, fillDTO(FullOfferRdo, offer));
  }

  public async update({body, params}: Request<Record<string, string>, Record<string, unknown>, UpdateOfferDto>, res: Response): Promise<void> {
    const offer = await this.offerService.updateById(params.offerId, body);
    this.ok(res, fillDTO(FullOfferRdo, offer));
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const offer = await this.offerService.deleteById(req.params.offerId);
    this.noContent(res, fillDTO(FullOfferRdo, offer));
  }

  public async getPremium(req: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findPremium(req.params.city as City);
    this.ok(res, fillDTO(OfferRdo, offers));
  }

  public async getFavorite({ tokenPayload }: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findFavorite(tokenPayload.id);
    this.ok(res, fillDTO(OfferRdo, offers));
  }

  public async addToFavorite({ tokenPayload, params }: Request, res: Response): Promise<void> {
    const offer = await this.offerService.addToFavorite({userId: tokenPayload.id, offerId: params.offerId});
    this.created(res, fillDTO(FullOfferRdo, offer));
  }

  public async deleteFromFavorite({ tokenPayload, params }: Request, res: Response): Promise<void> {
    const offer = await this.offerService.deleteFromFavorite({userId: tokenPayload.id, offerId: params.offerId});
    this.noContent(res, fillDTO(FullOfferRdo, offer));
  }
}
