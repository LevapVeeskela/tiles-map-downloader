# tiles-map-downloader

Библиотека для скачивания картографических тайлов / Library for downloading map tiles

---

## Описание / Description

### Русский

`tiles-map-downloader` - npm-пакет для скачивания картографических тайлов из различных источников (Google Maps, Yandex Maps, OpenStreetMap, Bing Maps) по заданным координатам и уровню зума.

**Возможности:**
- Поддержка 4 провайдеров: Google, Yandex, OSM, Bing
- Скачивание тайлов по координатам центра и радиусу
- Скачивание тайлов по границам (bounding box)
- Настраиваемая параллельная загрузка
- Сохранение тайлов в локальную директорию
- Полная TypeScript типизация
- CLI-интерфейс для командной строки

### English

`tiles-map-downloader` - npm package for downloading map tiles from various providers (Google Maps, Yandex Maps, OpenStreetMap, Bing Maps) by specified coordinates and zoom level.

**Features:**
- Support for 4 providers: Google, Yandex, OSM, Bing
- Download tiles by center point and radius
- Download tiles by bounding box
- Configurable parallel downloads
- Save tiles to local directory
- Full TypeScript typing
- CLI interface

---

## Установка / Installation

```bash
npm install tiles-map-downloader
```

---

## Быстрый старт / Quick Start

### JavaScript / TypeScript

```javascript
const { TileDownloader } = require('tiles-map-downloader');

async function download() {
  const downloader = new TileDownloader('osm', {
    maxConcurrency: 6,
    outputDir: './tiles'
  });

  const center = { lat: 53.9, lng: 27.5 }; // Minsk
  const tiles = TileDownloader.getTilesInBounds(center, 10, 1);
  
  const result = await downloader.downloadTiles(tiles);
  console.log(`Success: ${result.success}, Failed: ${result.failed}`);
}

download();
```

### CLI

```bash
# Download OSM tiles (zoom 10)
npx tiles-download osm 10

# Download Google tiles for Minsk (zoom 15)
npx tiles-download google 15 '{"north": 54.1, "south": 53.7, "west": 27.3, "east": 27.8}'
```

---

## Примеры / Examples

### Скачивание области Беларуси / Download Belarus region

```javascript
const { TileDownloader } = require('tiles-map-downloader');

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
```

### Использование провайдеров / Using providers

```javascript
const { TileProviderFactory } = require('tiles-map-downloader');

const google = TileProviderFactory.create('google', { lang: 'en' });
const url = google.getTileUrl(605, 341, 10);
// https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10&hl=en
```

---

## API Reference

### TileDownloader

| Метод / Method | Описание / Description |
|----------------|------------------------|
| `new TileDownloader(provider, options)` | Конструктор / Constructor |
| `downloadTile(coords)` | Скачать один тайл / Download single tile |
| `downloadTiles(coordsList)` | Скачать массив тайлов / Download tiles array |
| `downloadArea(bounds, zoom)` | Скачать область / Download area |

### Статические методы / Static Methods

| Метод / Method | Описание / Description |
|----------------|------------------------|
| `latLngToTile(lat, lng, z)` | Координаты → Тайл / Coordinates → Tile |
| `tileToLatLng(x, y, z)` | Тайл → Координаты / Tile → Coordinates |
| `getTilesInBounds(center, zoom, radius)` | Получить тайлы вокруг центра / Get tiles around center |

### Опции / Options

```javascript
{
  maxConcurrency: 6,    // Макс. параллельных запросов / Max parallel requests
  outputDir: 'tiles',   // Папка для сохранения / Output folder
  lang: 'ru',          // Язык карты / Map language
  onProgress: (c, t) => {},  // Коллбэк прогресса / Progress callback
  onTileDownloaded: (c, p) => {},  // При скачивании тайла / On tile downloaded
  onTileError: (c, e) => {}  // При ошибке / On error
}
```

---

## CLI Arguments / Аргументы CLI

```
tiles-download <provider> <zoom> [bounds] [lang] [concurrency] [outputDir]

provider     - Провайдер: google, yandex, osm, bing
zoom         - Уровень зума (0-19)
bounds       - JSON: {"north": N, "south": S, "west": W, "east": E}
lang         - Язык (по умолчанию: ru)
concurrency  - Параллельные загрузки (по умолчанию: 6)
outputDir    - Папка (по умолчанию: tiles)
```

---

## Поддерживаемые провайдеры / Supported Providers

| Провайдер / Provider | Пример URL / URL Example |
|---------------------|-------------------------|
| google | `https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10` |
| yandex | `https://core-renderer-tiles.maps.yandex.net/tiles?l=sat&x=605&y=341&z=10` |
| osm | `https://tile.openstreetmap.org/10/605/341.png` |
| bing | `https://ecn.t0.tiles.virtualearth.net/tiles/a0123.png?g=1` |

---

## Типы данных / Data Types

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

## GitHub

Исходный код и документация доступны на GitHub:
https://github.com/LevapVeeskela/tiles-map-downloader

## Поддержка

Сообщить об ошибках и предложить улучшения:
https://github.com/LevapVeeskela/tiles-map-downloader/issues

## Тестирование

```bash
npm test
```
