# tiles-map-downloader

## Description

`tiles-map-downloader` is an npm package for downloading map tiles from various providers (Google Maps, Yandex Maps, OpenStreetMap, Bing Maps) by specified coordinates and zoom level.

### Features

- Support for 4 providers: Google, Yandex, OSM, Bing
- Download tiles by center point and radius
- Download tiles by bounding box
- Configurable parallel downloads
- Save tiles to local directory
- Full TypeScript typing
- CLI interface

---

## Installation

```bash
npm install tiles-map-downloader
```

---

## Quick Start

### JavaScript / TypeScript

```javascript
const { TileDownloader } = require('tiles-map-downloader');

async function download() {
  const downloader = new TileDownloader('osm', {
    maxConcurrency: 6,
    outputDir: './tiles'
  });

  const center = { lat: 53.9, lng: 27.5 };
  const tiles = TileDownloader.getTilesInBounds(center, 10, 1);
  
  const result = await downloader.downloadTiles(tiles);
  console.log(`Success: ${result.success}, Failed: ${result.failed}`);
}

download();
```

### CLI

```bash
npx tiles-download osm 10
npx tiles-download google 12 '{"north": 56.2, "south": 51.2, "west": 23.2, "east": 32.8}'
```

---

## API

### TileDownloader

| Method | Description |
|--------|-------------|
| `new TileDownloader(provider, options)` | Constructor |
| `downloadTile(coords)` | Download single tile |
| `downloadTiles(coordsList)` | Download array of tiles |
| `downloadArea(bounds, zoom)` | Download area |

### Static Methods

| Method | Description |
|--------|-------------|
| `latLngToTile(lat, lng, z)` | Coordinates → Tile |
| `tileToLatLng(x, y, z)` | Tile → Coordinates |
| `getTilesInBounds(center, zoom, radius)` | Get tiles around center |

### Options

```javascript
{
  maxConcurrency: 6,    // Max parallel requests
  outputDir: 'tiles',   // Output folder
  lang: 'ru',          // Map language
  onProgress: (c, t) => {},
  onTileDownloaded: (c, p) => {},
  onTileError: (c, e) => {}
}
```

---

## CLI

```
tiles-download <provider> <zoom> [bounds] [lang] [concurrency] [outputDir]

provider     - google, yandex, osm, bing
zoom         - Zoom level (0-19)
bounds       - {"north": N, "south": S, "west": W, "east": E}
lang         - Language (default: ru)
concurrency  - Max parallel downloads (default: 6)
outputDir    - Output folder (default: tiles)
```

---

## Supported Providers

| Provider | URL |
|----------|-----|
| google | `https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10` |
| yandex | `https://core-renderer-tiles.maps.yandex.net/tiles?l=sat&x=605&y=341&z=10` |
| osm | `https://tile.openstreetmap.org/10/605/341.png` |
| bing | `https://ecn.t0.tiles.virtualearth.net/tiles/a0123.png?g=1` |

---

## Data Types

```typescript
interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}

interface BoundingBox {
  north: number;
  south: number;
  west: number;
  east: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface DownloadResult {
  success: number;
  failed: number;
  tiles: TileResult[];
}
```

---

## Testing

```bash
npm test
```

---

## License

MIT

---

## GitHub

Source code: https://github.com/LevapVeeskela/tiles-map-downloader

Issues: https://github.com/LevapVeeskela/tiles-map-downloader/issues
