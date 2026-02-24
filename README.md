# tiles-map-downloader

## Описание

`tiles-map-downloader` - npm-пакет для скачивания картографических тайлов из различных источников (Google Maps, Yandex Maps, OpenStreetMap, Bing Maps) по заданным координатам и уровню зума.

### Возможности

- Поддержка 4 провайдеров: Google, Yandex, OSM, Bing
- Скачивание тайлов по координатам центра и радиусу
- Скачивание тайлов по границам (bounding box)
- Настраиваемая параллельная загрузка
- Сохранение тайлов в локальную директорию
- Полная TypeScript типизация
- CLI-интерфейс для командной строки

---

## Установка

```bash
npm install tiles-map-downloader
```

---

## Быстрый старт

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

| Метод | Описание |
|-------|----------|
| `new TileDownloader(provider, options)` | Конструктор |
| `downloadTile(coords)` | Скачать один тайл |
| `downloadTiles(coordsList)` | Скачать массив тайлов |
| `downloadArea(bounds, zoom)` | Скачать область |

### Статические методы

| Метод | Описание |
|-------|----------|
| `latLngToTile(lat, lng, z)` | Координаты → Тайл |
| `tileToLatLng(x, y, z)` | Тайл → Координаты |
| `getTilesInBounds(center, zoom, radius)` | Получить тайлы вокруг центра |

### Опции

```javascript
{
  maxConcurrency: 6,    // Макс. параллельных запросов
  outputDir: 'tiles',   // Папка для сохранения
  lang: 'ru',          // Язык карты
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
zoom         - Уровень зума (0-19)
bounds       - {"north": N, "south": S, "west": W, "east": E}
lang         - Язык (по умолчанию: ru)
concurrency  - Параллельные загрузки (по умолчанию: 6)
outputDir    - Папка (по умолчанию: tiles)
```

---

## Поддерживаемые провайдеры

| Провайдер | URL |
|-----------|-----|
| google | `https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10` |
| yandex | `https://core-renderer-tiles.maps.yandex.net/tiles?l=sat&x=605&y=341&z=10` |
| osm | `https://tile.openstreetmap.org/10/605/341.png` |
| bing | `https://ecn.t0.tiles.virtualearth.net/tiles/a0123.png?g=1` |

---

## Типы данных

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

## Тестирование

```bash
npm test
```

---

## Лицензия

MIT

---

## GitHub

Исходный код: https://github.com/LevapVeeskela/tiles-map-downloader

Проблемы: https://github.com/LevapVeeskela/tiles-map-downloader/issues
