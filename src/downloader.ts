import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { TileCoordinates, BoundingBox, LatLng, DownloadOptions, ProviderName, DownloadResult, TileResult } from './types';
import { TileProviderFactory } from './providers';
import type { TileProvider } from './types';

export class TileDownloader {
  private provider: TileProvider;
  private options: Required<DownloadOptions>;

  constructor(provider: TileProvider | ProviderName, options: DownloadOptions = {}) {
    this.provider = typeof provider === 'string' 
      ? TileProviderFactory.create(provider, { lang: options.lang }) 
      : provider;

    this.options = {
      maxConcurrency: options.maxConcurrency ?? 6,
      outputDir: options.outputDir ?? 'tiles',
      lang: options.lang ?? 'ru',
      onProgress: options.onProgress ?? (() => {}),
      onTileDownloaded: options.onTileDownloaded ?? (() => {}),
      onTileError: options.onTileError ?? (() => {}),
    };
  }

  static latLngToTile(lat: number, lng: number, z: number): TileCoordinates {
    const n = Math.pow(2, z);
    const x = Math.floor((lng + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y, z };
  }

  static tileToLatLng(x: number, y: number, z: number): LatLng {
    const n = Math.pow(2, z);
    const lng = x / n * 360.0 - 180.0;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const lat = latRad * 180.0 / Math.PI;
    return { lat, lng };
  }

  static isTileInBounds(x: number, y: number, z: number, bounds: BoundingBox | null): boolean {
    if (!bounds) return true;
    const n = Math.pow(2, z);
    const lng = x / n * 360.0 - 180.0;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const lat = latRad * 180.0 / Math.PI;
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
  }

  static getTilesInBounds(center: LatLng, zoom: number, radiusTiles: number = 1): TileCoordinates[] {
    const centerTile = TileDownloader.latLngToTile(center.lat, center.lng, zoom);
    const tiles: TileCoordinates[] = [];

    for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
      for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
        tiles.push({
          x: centerTile.x + dx,
          y: centerTile.y + dy,
          z: zoom,
        });
      }
    }

    return tiles;
  }

  async downloadTile(coords: TileCoordinates): Promise<TileResult> {
    const url = this.provider.getTileUrl(coords.x, coords.y, coords.z, this.options.lang);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    return {
      coordinates: coords,
      buffer,
      provider: this.provider.name,
    };
  }

  async saveTile(coords: TileCoordinates, outputDir?: string): Promise<string> {
    const dir = outputDir ?? this.options.outputDir;
    const outputPath = path.join(dir, this.provider.name, coords.z.toString(), coords.x.toString());
    const filePath = path.join(outputPath, `${coords.y}.png`);

    const tile = await this.downloadTile(coords);

    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(filePath, tile.buffer);

    this.options.onTileDownloaded(coords, filePath);
    return filePath;
  }

  async downloadArea(bounds: BoundingBox, zoom: number): Promise<DownloadResult> {
    const tiles = this.getTilesInBoundsForZoom(bounds, zoom);
    return this.downloadTiles(tiles);
  }

  async downloadTiles(coordsList: TileCoordinates[]): Promise<DownloadResult> {
    const results: TileResult[] = [];
    let failed = 0;
    const total = coordsList.length;
    let completed = 0;

    const chunks: TileCoordinates[][] = [];
    for (let i = 0; i < coordsList.length; i += this.options.maxConcurrency) {
      chunks.push(coordsList.slice(i, i + this.options.maxConcurrency));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (coords): Promise<void> => {
        try {
          const tile = await this.downloadTile(coords);
          
          const outputPath = path.join(
            this.options.outputDir,
            this.provider.name,
            coords.z.toString(),
            coords.x.toString()
          );
          const filePath = path.join(outputPath, `${coords.y}.png`);

          fs.mkdirSync(outputPath, { recursive: true });
          fs.writeFileSync(filePath, tile.buffer);

          results.push(tile);
          this.options.onTileDownloaded(coords, filePath);
        } catch (error) {
          failed++;
          this.options.onTileError(coords, error as Error);
        }
        completed++;
        this.options.onProgress(completed, total);
      });

      await Promise.all(promises);
    }

    return {
      success: results.length,
      failed,
      tiles: results,
    };
  }

  private getTilesInBoundsForZoom(bounds: BoundingBox, z: number): TileCoordinates[] {
    const tiles: TileCoordinates[] = [];
    const n = Math.pow(2, z);

    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        if (TileDownloader.isTileInBounds(x, y, z, bounds)) {
          tiles.push({ x, y, z });
        }
      }
    }

    return tiles;
  }

  setProvider(provider: TileProvider | ProviderName): void {
    this.provider = typeof provider === 'string'
      ? TileProviderFactory.create(provider, { lang: this.options.lang })
      : provider;
  }

  getProvider(): TileProvider {
    return this.provider;
  }
}
