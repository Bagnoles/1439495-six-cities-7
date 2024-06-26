import { Expose, Type } from 'class-transformer';
import { Amenities, City, Coordinates, OfferType } from '../../../types/index.js';
import { UserRdo } from '../../user/index.js';

export class FullOfferRdo {
  @Expose()
  public id: string;

  @Expose()
  public name: string;

  @Expose()
  public description: string;

  @Expose()
  public date: Date;

  @Expose()
  public city: City;

  @Expose()
  public previewImage: string;

  @Expose()
  public photo: string[];

  @Expose()
  public isPremium: boolean;

  @Expose()
  public isFavorite: boolean;

  @Expose()
  public rating: number;

  @Expose()
  public commentCount: number;

  @Expose()
  public type: OfferType;

  @Expose()
  public rooms: number;

  @Expose()
  public guests: number;

  @Expose()
  public price: number;

  @Expose()
  public amenities: Amenities[];

  @Expose()
  @Type(() => UserRdo)
  public user: UserRdo;

  @Expose()
  public coordinates: Coordinates;
}
