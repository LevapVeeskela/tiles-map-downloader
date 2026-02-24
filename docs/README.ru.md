# tiles-map-downloader

Библиотека для скачивания картографических тайлов из различных источников (Google Maps, Yandex Maps, OpenStreetMap, Bing Maps) по заданным координатам и уровню зума.

## Возможности

- Поддержка 4 провайдеров: Google, Yandex, OSM, Bing
- Скачивание тайлов по координатам центра и радиусу
- Скачивание тайлов по границам (bounding box)
- Настраиваемая параллельная загрузка
- Сохранение тайлов в локальную директорию
- Полная TypeScript типизация
- CLI-интерфейс для командной строки

## Установка

```bash
npm install tiles-map-downloader
```

## Использование

### JavaScript/TypeScript

```typescript
import { TileDownloader, TileProviderFactory } from 'tiles-map-downloader';

// Создание загрузчика с провайдером
const downloader = new TileDownloader('google', {
  lang: 'ru',
  maxConcurrency: 6,
  outputDir: './tiles',
  onProgress: (completed, total) => {
    console.log(`Прогресс: ${completed}/${total}`);
  }
});

// Скачивание тайлов по центральной точке и радиусу
const center = { lat: 53.9, lng: 27.5 }; // Минск
const tiles = TileDownloader.getTilesInBoundsForZoom(center, 15, 2);
const result = await downloader.downloadTiles(tiles);

console.log(`Успешно: ${result.success}, Ошибки: ${result.failed}`);
```

### CLI

```bash
# Скачать тайлы Google для Минска (zoom 15)
npx tiles-download google 15 '{"north": 54.1, "south": 53.7, "west": 27.3, "east": 27.8}' ru 10

# Скачать тайлы OSM для мира (zoom 5)
npx tiles-download osm 5

# Аргументы
tiles-download <provider> <zoom> [bounds] [lang] [concurrency] [outputDir]

provider     - Провайдер: google, yandex, osm, bing
zoom         - Уровень зума (0-19)
bounds       - JSON-объект с границами: {"north": N, "south": S, "west": W, "east": E}
lang         - Язык (по умолчанию: ru)
concurrency  - Макс. параллельных загрузок (по умолчанию: 6)
outputDir    - Папка для сохранения (по умолчанию: tiles)
```

## API

### TileDownloader

#### Конструктор

```typescript
new TileDownloader(provider: TileProvider | ProviderName, options?: DownloadOptions)
```

#### Параметры

- `provider` - Имя провайдера или экземпляр провайдера
- `options` - Настройки загрузки

#### Опции DownloadOptions

```typescript
interface DownloadOptions {
  maxConcurrency?: number;  // Макс. параллельных запросов (по умолчанию: 6)
  outputDir?: string;       // Директория для сохранения (по умолчанию: 'tiles')
  lang?: string;           // Язык карты (по умолчанию: 'ru')
  onProgress?: (completed: number, total: number) => void;
  onTileDownloaded?: (coords: TileCoordinates, filePath: string) => void;
  onTileError?: (coords: TileCoordinates, error: Error) => void;
}
```

#### Методы

##### downloadTile(coords: TileCoordinates): Promise<TileResult>

Скачивает один тайл и возвращает его буфер.

##### downloadTiles(coordsList: TileCoordinates[]): Promise<DownloadResult>

Скачивает массив тайлов.

##### downloadArea(bounds: BoundingBox, zoom: number): Promise<DownloadResult>

Скачивает все тайлы для указанной области.

### Статические методы TileDownloader

##### latLngToTile(lat: number, lng: number, z: number): TileCoordinates

Преобразует географические координаты в координаты тайла.

##### tileToLatLng(x: number, y: number, z: number): LatLng

Преобразует координаты тайла в географические координаты.

##### isTileInBounds(x: number, y: number, z: number, bounds: BoundingBox): boolean

Проверяет, находится ли тайл в указанных границах.

##### getTilesInBounds(center: LatLng, zoom: number, radiusTiles: number): TileCoordinates[]

Возвращает массив координат тайлов вокруг центра.

### TileProviderFactory

##### create(providerName: string, options?: ProviderOptions): TileProvider

Создает экземпляр провайдера.

##### getSupportedProviders(): string[]

Возвращает список поддерживаемых провайдеров.

## Примеры

### Скачивание области Беларуси

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

### Использование провайдеров напрямую

```typescript
import { TileProviderFactory } from 'tiles-map-downloader';

const google = TileProviderFactory.create('google', { lang: 'en' });
const url = google.getTileUrl(605, 341, 10);
console.log(url); // https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10&hl=en
```

### Работа с буферами

```typescript
import { TileDownloader } from 'tiles-map-downloader';

const downloader = new TileDownloader('osm');
const tile = await downloader.downloadTile({ x: 1159, y: 673, z: 11 });

// tile.buffer содержит PNG-данные
console.log(`Размер: ${tile.buffer.length} байт`);
```

## Типы данных

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

## Лицензия

MIT
