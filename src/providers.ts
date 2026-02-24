import { TileProvider, ProviderOptions } from './types';

export class GoogleTileProvider implements TileProvider {
  readonly name = 'google';
  private langParam: string;

  constructor(options: ProviderOptions = {}) {
    this.langParam = options.lang ? `&hl=${options.lang}` : '';
  }

  getTileUrl(x: number, y: number, z: number, lang?: string): string {
    const langPart = lang ? `&hl=${lang}` : this.langParam;
    return `https://mt.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}${langPart}`;
  }
}

export class YandexTileProvider implements TileProvider {
  readonly name = 'yandex';
  private langParam: string;

  constructor(options: ProviderOptions = {}) {
    this.langParam = options.lang ? `&lang=${options.lang}` : '';
  }

  getTileUrl(x: number, y: number, z: number, lang?: string): string {
    const langPart = lang ? `&lang=${lang}` : this.langParam;
    return `https://core-renderer-tiles.maps.yandex.net/tiles?l=sat&x=${x}&y=${y}&z=${z}${langPart}`;
  }
}

export class OpenStreetMapTileProvider implements TileProvider {
  readonly name = 'osm';

  getTileUrl(x: number, y: number, z: number): string {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }
}

export class BingTileProvider implements TileProvider {
  readonly name = 'bing';

  getTileUrl(x: number, y: number, z: number): string {
    return `https://ecn.t${(x + y) % 4}.tiles.virtualearth.net/tiles/a${this.quadKey(x, y, z)}.png?g=1`;
  }

  private quadKey(x: number, y: number, z: number): string {
    let key = '';
    for (let i = z; i > 0; i--) {
      let digit = 0;
      const mask = 1 << (i - 1);
      if ((x & mask) !== 0) digit += 1;
      if ((y & mask) !== 0) digit += 2;
      key += digit;
    }
    return key;
  }
}

export class TileProviderFactory {
  static create(providerName: string, options: ProviderOptions = {}): TileProvider {
    switch (providerName) {
      case 'google':
        return new GoogleTileProvider(options);
      case 'yandex':
        return new YandexTileProvider(options);
      case 'osm':
        return new OpenStreetMapTileProvider();
      case 'bing':
        return new BingTileProvider();
      default:
        throw new Error(`Provider "${providerName}" is not supported`);
    }
  }

  static getSupportedProviders(): string[] {
    return ['google', 'yandex', 'osm', 'bing'];
  }
}
