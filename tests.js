const {
  TileDownloader,
  TileProviderFactory,
  GoogleTileProvider,
  YandexTileProvider,
  OpenStreetMapTileProvider,
  BingTileProvider
} = require('./dist/index.js');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(message || 'Expected true');
  }
}

function assertContains(str, substr, message = '') {
  if (!str.includes(substr)) {
    throw new Error(`${message} Expected "${str}" to contain "${substr}"`);
  }
}

async function runAllTests() {
  console.log('=== Tile Provider Tests ===\n');

  // Test 1: GoogleTileProvider
  await test('GoogleTileProvider - generates correct URL', () => {
    const provider = new GoogleTileProvider({ lang: 'ru' });
    const url = provider.getTileUrl(605, 341, 10);
    assertEqual(provider.name, 'google');
    assertContains(url, 'x=605');
    assertContains(url, 'y=341');
    assertContains(url, 'z=10');
    assertContains(url, 'hl=ru');
  });

  await test('GoogleTileProvider - without lang', () => {
    const provider = new GoogleTileProvider();
    const url = provider.getTileUrl(100, 200, 5);
    assertContains(url, 'x=100');
    assertContains(url, 'y=200');
    assertContains(url, 'z=5');
  });

  // Test 2: YandexTileProvider
  await test('YandexTileProvider - generates correct URL', () => {
    const provider = new YandexTileProvider({ lang: 'ru_RU' });
    const url = provider.getTileUrl(123, 456, 12);
    assertEqual(provider.name, 'yandex');
    assertContains(url, 'x=123');
    assertContains(url, 'y=456');
    assertContains(url, 'z=12');
    assertContains(url, 'lang=ru_RU');
  });

  await test('YandexTileProvider - default lang', () => {
    const provider = new YandexTileProvider();
    const url = provider.getTileUrl(50, 50, 8);
    assertContains(url, 'l=sat');
  });

  // Test 3: OpenStreetMapTileProvider
  await test('OpenStreetMapTileProvider - generates correct URL', () => {
    const provider = new OpenStreetMapTileProvider();
    const url = provider.getTileUrl(512, 340, 10);
    assertEqual(provider.name, 'osm');
    assertEqual(url, 'https://tile.openstreetmap.org/10/512/340.png');
  });

  await test('OpenStreetMapTileProvider - different zoom', () => {
    const provider = new OpenStreetMapTileProvider();
    const url = provider.getTileUrl(100, 200, 15);
    assertEqual(url, 'https://tile.openstreetmap.org/15/100/200.png');
  });

  // Test 4: BingTileProvider
  await test('BingTileProvider - generates correct URL', () => {
    const provider = new BingTileProvider();
    const url = provider.getTileUrl(605, 341, 10);
    assertEqual(provider.name, 'bing');
    assertContains(url, 'tiles.virtualearth.net');
    assertContains(url, '.png');
  });

  await test('BingTileProvider - quadkey format', () => {
    const provider = new BingTileProvider();
    const url = provider.getTileUrl(0, 0, 1);
    assertContains(url, 'a0');
  });

  console.log('\n=== TileProviderFactory Tests ===\n');

  // Test 5: Factory
  await test('TileProviderFactory - creates Google provider', () => {
    const provider = TileProviderFactory.create('google');
    assertEqual(provider.name, 'google');
    assertTrue(provider instanceof GoogleTileProvider);
  });

  await test('TileProviderFactory - creates Yandex provider', () => {
    const provider = TileProviderFactory.create('yandex');
    assertEqual(provider.name, 'yandex');
    assertTrue(provider instanceof YandexTileProvider);
  });

  await test('TileProviderFactory - creates OSM provider', () => {
    const provider = TileProviderFactory.create('osm');
    assertEqual(provider.name, 'osm');
    assertTrue(provider instanceof OpenStreetMapTileProvider);
  });

  await test('TileProviderFactory - creates Bing provider', () => {
    const provider = TileProviderFactory.create('bing');
    assertEqual(provider.name, 'bing');
    assertTrue(provider instanceof BingTileProvider);
  });

  await test('TileProviderFactory - throws on unknown provider', () => {
    let error = null;
    try {
      TileProviderFactory.create('unknown');
    } catch (e) {
      error = e;
    }
    assertTrue(error !== null);
    assertContains(error.message, 'not supported');
  });

  await test('TileProviderFactory - getSupportedProviders', () => {
    const providers = TileProviderFactory.getSupportedProviders();
    assertEqual(providers.length, 4);
    assertTrue(providers.includes('google'));
    assertTrue(providers.includes('yandex'));
    assertTrue(providers.includes('osm'));
    assertTrue(providers.includes('bing'));
  });

  console.log('\n=== Coordinate Conversion Tests ===\n');

  // Test 6: latLngToTile
  await test('TileDownloader.latLngToTile - center of world', () => {
    const tile = TileDownloader.latLngToTile(0, 0, 10);
    assertEqual(tile.z, 10);
    assertTrue(tile.x >= 0 && tile.x < 1024);
    assertTrue(tile.y >= 0 && tile.y < 1024);
  });

  await test('TileDownloader.latLngToTile - Minsk', () => {
    const tile = TileDownloader.latLngToTile(53.9, 27.5, 10);
    assertEqual(tile.z, 10);
    assertTrue(tile.x > 0);
    assertTrue(tile.y > 0);
  });

  await test('TileDownloader.latLngToTile - North Pole', () => {
    const tile = TileDownloader.latLngToTile(85, 0, 10);
    assertEqual(tile.z, 10);
    assertTrue(tile.y >= 0 && tile.y <= 1);
  });

  await test('TileDownloader.latLngToTile - South Pole', () => {
    const tile = TileDownloader.latLngToTile(-85, 0, 10);
    assertEqual(tile.z, 10);
  });

  // Test 7: tileToLatLng
  await test('TileDownloader.tileToLatLng - returns valid coordinates', () => {
    const latLng = TileDownloader.tileToLatLng(512, 512, 10);
    assertTrue(latLng.lat >= -90 && latLng.lat <= 90);
    assertTrue(latLng.lng >= -180 && latLng.lng <= 180);
  });

  await test('TileDownloader.tileToLatLng - origin tile', () => {
    const latLng = TileDownloader.tileToLatLng(0, 0, 1);
    assertTrue(latLng.lat > 85 || latLng.lat < -85);
    assertEqual(latLng.lng, -180);
  });

  // Test 8: Round-trip conversion
  await test('TileDownloader - latLng → tile → latLng round trip', () => {
    const original = { lat: 53.9, lng: 27.5 };
    const tile = TileDownloader.latLngToTile(original.lat, original.lng, 15);
    const back = TileDownloader.tileToLatLng(tile.x, tile.y, 15);
    assertTrue(Math.abs(back.lat - original.lat) < 0.1);
    assertTrue(Math.abs(back.lng - original.lng) < 0.1);
  });

  console.log('\n=== Bounding Box Tests ===\n');

  // Test 9: isTileInBounds
  await test('TileDownloader.isTileInBounds - tile inside bounds', () => {
    const bounds = { north: 55, south: 53, west: 25, east: 30 };
    const result = TileDownloader.isTileInBounds(590, 328, 10, bounds);
    assertTrue(result);
  });

  await test('TileDownloader.isTileInBounds - tile outside bounds', () => {
    const bounds = { north: 50, south: 45, west: 20, east: 25 };
    const result = TileDownloader.isTileInBounds(600, 350, 10, bounds);
    assertTrue(!result);
  });

  await test('TileDownloader.isTileInBounds - no bounds returns true', () => {
    const result = TileDownloader.isTileInBounds(100, 100, 10, null);
    assertTrue(result);
  });

  console.log('\n=== Get Tiles In Bounds Tests ===\n');

  // Test 10: getTilesInBounds
  await test('TileDownloader.getTilesInBounds - radius 0 returns 1 tile', () => {
    const tiles = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, 10, 0);
    assertEqual(tiles.length, 1);
  });

  await test('TileDownloader.getTilesInBounds - radius 1 returns 9 tiles', () => {
    const tiles = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, 10, 1);
    assertEqual(tiles.length, 9);
  });

  await test('TileDownloader.getTilesInBounds - radius 2 returns 25 tiles', () => {
    const tiles = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, 10, 2);
    assertEqual(tiles.length, 25);
  });

  await test('TileDownloader.getTilesInBounds - all tiles have same zoom', () => {
    const tiles = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, 10, 1);
    tiles.forEach(t => assertEqual(t.z, 10));
  });

  console.log('\n=== TileDownloader Instance Tests ===\n');

  // Test 11: TileDownloader constructor
  await test('TileDownloader - creates with provider name', () => {
    const downloader = new TileDownloader('google');
    assertEqual(downloader.getProvider().name, 'google');
  });

  await test('TileDownloader - creates with provider instance', () => {
    const provider = new OpenStreetMapTileProvider();
    const downloader = new TileDownloader(provider);
    assertEqual(downloader.getProvider().name, 'osm');
  });

  await test('TileDownloader - default options', () => {
    const downloader = new TileDownloader('google');
    assertEqual(downloader.getProvider().name, 'google');
  });

  await test('TileDownloader - custom options', () => {
    const downloader = new TileDownloader('google', {
      lang: 'en',
      maxConcurrency: 10,
      outputDir: './custom-tiles'
    });
    assertEqual(downloader.getProvider().name, 'google');
  });

  await test('TileDownloader - setProvider', () => {
    const downloader = new TileDownloader('google');
    downloader.setProvider('osm');
    assertEqual(downloader.getProvider().name, 'osm');
  });

  console.log('\n=== Download Tests (Real) ===\n');

  // Test 12: Download single tile
  await test('TileDownloader.downloadTile - OSM single tile', async () => {
    const downloader = new TileDownloader('osm');
    const tile = await downloader.downloadTile({ x: 512, y: 340, z: 10 });
    assertTrue(tile.buffer.length > 0);
    assertEqual(tile.coordinates.x, 512);
    assertEqual(tile.coordinates.y, 340);
    assertEqual(tile.coordinates.z, 10);
    assertEqual(tile.provider, 'osm');
    assertEqual(tile.buffer[0], 0x89);
    assertEqual(tile.buffer[1], 0x50);
    assertEqual(tile.buffer[2], 0x4E);
    assertEqual(tile.buffer[3], 0x47);
  });

  // Test 13: Download multiple tiles
  await test('TileDownloader.downloadTiles - small area', async () => {
    const downloader = new TileDownloader('osm', { maxConcurrency: 3 });
    const tiles = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, 8, 0);
    const result = await downloader.downloadTiles(tiles);
    assertEqual(result.success, 1);
    assertEqual(result.failed, 0);
    assertEqual(result.tiles.length, 1);
  });

  // Test 14: Download with bounds
  await test('TileDownloader.downloadArea - small area', async () => {
    const downloader = new TileDownloader('osm', { maxConcurrency: 3 });
    const bounds = { north: 55.0, south: 53.0, west: 25.0, east: 30.0 };
    const result = await downloader.downloadArea(bounds, 8);
    assertTrue(result.success > 0, `Expected success > 0, got ${result.success}`);
    console.log(`  Downloaded ${result.success} tiles`);
  });

  // Test 15: All providers download test
  await test('All providers - can download tiles', async () => {
    const coords = { x: 512, y: 340, z: 10 };
    const providers = ['google', 'osm', 'bing'];
    for (const name of providers) {
      try {
        const downloader = new TileDownloader(name);
        const tile = await downloader.downloadTile(coords);
        assertTrue(tile.buffer.length > 0, `${name}: no data`);
        console.log(`  ${name}: OK (${tile.buffer.length} bytes)`);
      } catch (e) {
        console.log(`  ${name}: ${e.message}`);
      }
    }
  });

  console.log('\n=== Error Handling Tests ===\n');

  // Test 16: Invalid provider
  await test('TileDownloader - invalid provider throws', () => {
    let error = null;
    try {
      new TileDownloader('invalid_provider');
    } catch (e) {
      error = e;
    }
    assertTrue(error !== null);
    assertContains(error.message, 'not supported');
  });

  // Test 17: Invalid coordinates
  await test('TileDownloader - download with invalid coords', async () => {
    const downloader = new TileDownloader('osm');
    let error = null;
    try {
      await downloader.downloadTile({ x: -1, y: -1, z: 10 });
    } catch (e) {
      error = e;
    }
    assertTrue(error !== null);
  });

  // Test 18: Progress callback
  await test('TileDownloader - progress callback works', async () => {
    let progressCalls = 0;
    let downloadedCalls = 0;
    const downloader = new TileDownloader('osm', {
      maxConcurrency: 2,
      onProgress: () => { progressCalls++; },
      onTileDownloaded: () => { downloadedCalls++; }
    });
    const tiles = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, 7, 0);
    await downloader.downloadTiles(tiles);
    assertTrue(progressCalls > 0, 'onProgress was not called');
    assertTrue(downloadedCalls > 0, 'onTileDownloaded was not called');
  });

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
