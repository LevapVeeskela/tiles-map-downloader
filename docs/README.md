# tiles-map-downloader

Library for downloading map tiles from various providers (Google Maps, Yandex Maps, OpenStreetMap, Bing Maps) by specified coordinates and zoom level.

## Features

- Support for 4 providers: Google, Yandex, OSM, Bing
- Download tiles by center point and radius
- Download tiles by bounding box
- Configurable parallel downloads
- Save tiles to local directory
- Full TypeScript typing
- CLI interface

## Installation

```bash
npm install tiles-map-downloader
```

## Usage

### JavaScript/TypeScript

```typescript
import { TileDownloader, TileProviderFactory } from 'tiles-map-downloader';

// Create downloader with provider
const downloader = new TileDownloader('google', {
  lang: 'en',
  maxConcurrency: 6,
  outputDir: './tiles',
  onProgress: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`);
  }
});

// Download tiles by center point and radius
const center = { lat: 53.9, lng: 27.5 }; // Minsk
const tiles = TileDownloader.getTilesInBounds(center, 15, 2);
const result = await downloader.downloadTiles(tiles);

console.log(`Success: ${result.success}, Failed: ${result.failed}`);
```

### CLI

```bash
# Download Google tiles for Minsk (zoom 15)
npx tiles-download google 15 '{"north": 54.1, "south": 53.7, "west": 27.3, "east": 27.8}' ru 10

# Download OSM tiles for world (zoom 5)
npx tiles-download osm 5

# Arguments
tiles-download <provider> <zoom> [bounds] [lang] [concurrency] [outputDir]

provider     - Provider: google, yandex, osm, bing
zoom         - Zoom level (0-19)
bounds       - JSON bounds: {"north": N, "south": S, "west": W, "east": E}
lang         - Language (default: ru)
concurrency  - Max parallel downloads (default: 6)
outputDir    - Output folder (default: tiles)
```

## API

### TileDownloader

#### Constructor

```typescript
new TileDownloader(provider: TileProvider | ProviderName, options?: DownloadOptions)
```

#### Parameters

- `provider` - Provider name or provider instance
- `options` - Download options

#### DownloadOptions

```typescript
interface DownloadOptions {
  maxConcurrency?: number;  // Max parallel requests (default: 6)
  outputDir?: string;        // Output directory (default: 'tiles')
  lang?: string;            // Map language (default: 'ru')
  onProgress?: (completed: number, total: number) => void;
  onTileDownloaded?: (coords: TileCoordinates, filePath: string) => void;
  onTileError?: (coords: TileCoordinates, error: Error) => void;
}
```

#### Methods

##### downloadTile(coords: TileCoordinates): Promise<TileResult>

Downloads a single tile and returns its buffer.

##### downloadTiles(coordsList: TileCoordinates[]): Promise<DownloadResult>

Downloads an array of tiles.

##### downloadArea(bounds: BoundingBox, zoom: number): Promise<DownloadResult>

Downloads all tiles for the specified area.

### Static Methods

##### latLngToTile(lat: number, lng: number, z: number): TileCoordinates

Converts geographic coordinates to tile coordinates.

##### tileToLatLng(x: number, y: number, z: number): LatLng

Converts tile coordinates to geographic coordinates.

##### isTileInBounds(x: number, y: number, z: number, bounds: BoundingBox): boolean

Checks if tile is within specified bounds.

##### getTilesInBounds(center: LatLng, zoom: number, radiusTiles: number): TileCoordinates[]

Returns array of tile coordinates around center.

### TileProviderFactory

##### create(providerName: string, options?: ProviderOptions): TileProvider

Creates provider instance.

##### getSupportedProviders(): string[]

Returns list of supported providers.

## Examples

### Download Belarus region

```typescript
import { TileDownloader } from 'tiles-map-downloader';

const bounds = {
  north: 56.2,
  south: 51.2,
  west: 23.2,
  east: 32.8
};

const downloader = new TileDownloader('google', { 
  lang: 'ru',
  maxConcurrency: 10,
  outputDir: './belarus-tiles'
});

const result = await downloader.downloadArea(bounds, 10);
console.log(result);
```

### Using providers directly

```typescript
import { TileProviderFactory } from 'tiles-map-downloader';

const google = TileProviderFactory.create('google', { lang: 'en' });
const url = google.getTileUrl(605, 341, 10);
console.log(url); // https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10&hl=en
```

### Working with buffers

```typescript
import { TileDownloader } from 'tiles-map-downloader';

const downloader = new TileDownloader('osm');
const tile = await downloader.downloadTile({ x: 1159, y: 673, z: 11 });

// tile.buffer contains PNG data
console.log(`Size: ${tile.buffer.length} bytes`);
```

## Data Types

### TileCoordinates

```typescript
interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}
```

### BoundingBox

```typescript
interface BoundingBox {
  north: number;
  south: number;
  west: number;
  east: number;
}
```

### LatLng

```typescript
interface LatLng {
  lat: number;
  lng: number;
}
```

### DownloadResult

```typescript
interface DownloadResult {
  success: number;
  failed: number;
  tiles: TileResult[];
}
```

## License

MIT
