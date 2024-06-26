import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';
import { OfferService, DefaultOfferService, OfferEntity, OfferModel, OfferController } from './index.js';
import { Component } from '../../types/index.js';
import { Controller } from '../../libs/rest/controller/index.js';

export function createOfferContainer() {
  const offerContainer = new Container();
  offerContainer.bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  offerContainer.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);
  offerContainer.bind<Controller>(Component.OfferController).to(OfferController).inSingletonScope();

  return offerContainer;
}
