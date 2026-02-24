# tiles-map-downloader



`tiles-map-downloader` 是一个 npm 包，用于通过指定的坐标和缩放级别从各种## 描述地图提供商（Google Maps、Yandex Maps、OpenStreetMap、Bing Maps）下载地图瓦片。

### 功能特点

- 支持 4 个提供商：Google、Yandex、OSM、Bing
- 按中心点和半径下载瓦片
- 按边界框下载瓦片
- 可配置的并行下载
- 保存瓦片到本地目录
- 完整的 TypeScript 类型
- CLI 命令行界面

---

## 安装

```bash
npm install tiles-map-downloader
```

---

## 快速开始

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

| 方法 | 描述 |
|------|------|
| `new TileDownloader(provider, options)` | 构造函数 |
| `downloadTile(coords)` | 下载单个瓦片 |
| `downloadTiles(coordsList)` | 下载瓦片数组 |
| `downloadArea(bounds, zoom)` | 下载区域 |

### 静态方法

| 方法 | 描述 |
|------|------|
| `latLngToTile(lat, lng, z)` | 坐标 → 瓦片 |
| `tileToLatLng(x, y, z)` | 瓦片 → 坐标 |
| `getTilesInBounds(center, zoom, radius)` | 获取中心周围的瓦片 |

### 选项

```javascript
{
  maxConcurrency: 6,    // 最大并发数
  outputDir: 'tiles',   // 输出文件夹
  lang: 'ru',          // 地图语言
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
zoom         - 缩放级别 (0-19)
bounds       - {"north": N, "south": S, "west": W, "east": E}
lang         - 语言 (默认: ru)
concurrency  - 最大并发下载数 (默认: 6)
outputDir    - 输出文件夹 (默认: tiles)
```

---

## 支持的提供商

| 提供商 | URL |
|--------|-----|
| google | `https://mt.google.com/vt/lyrs=y&x=605&y=341&z=10` |
| yandex | `https://core-renderer-tiles.maps.yandex.net/tiles?l=sat&x=605&y=341&z=10` |
| osm | `https://tile.openstreetmap.org/10/605/341.png` |
| bing | `https://ecn.t0.tiles.virtualearth.net/tiles/a0123.png?g=1` |

---

## 数据类型

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

## 测试

```bash
npm test
```

---

## 许可证

MIT

---

## GitHub

源代码：https://github.com/LevapVeeskela/tiles-map-downloader

问题反馈：https://github.com/LevapVeeskela/tiles-map-downloader/issues
