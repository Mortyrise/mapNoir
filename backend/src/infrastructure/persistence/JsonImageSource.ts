import { ImageSource, MapillaryImage } from '../../application';
import imagesData from '../data/mapillary-images.json';

export class JsonImageSource implements ImageSource {
  private images: MapillaryImage[];

  constructor() {
    this.images = imagesData as MapillaryImage[];
  }

  pickRandom(): MapillaryImage {
    return this.images[Math.floor(Math.random() * this.images.length)];
  }
}
