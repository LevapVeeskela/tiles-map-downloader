export interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DownloadOptions {
  maxConcurrency?: number;
  outputDir?: string;
  lang?: string;
  onProgress?: (completed: number, total: number) => void;
  onTileDownloaded?: (coords: TileCoordinates, filePath: string) => void;
  onTileError?: (coords: TileCoordinates, error: Error) => void;
}

export interface TileProvider {
  readonly name: string;
  getTileUrl(x: number, y: number, z: number, lang?: string): string;
}

export interface ProviderOptions {
  lang?: string;
}

export type ProviderName = 'google' | 'yandex' | 'osm' | 'bing';

export interface TileResult {
  coordinates: TileCoordinates;
  buffer: Buffer;
  provider: string;
}

export interface DownloadResult {
  success: number;
  failed: number;
  tiles: TileResult[];
}
