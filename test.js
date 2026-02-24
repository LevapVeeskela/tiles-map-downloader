const { TileDownloader } = require('./dist/index.js');

async function test() {
  console.log('=== Testing tiles-map-downloader ===\n');

  // Test 1: Get tiles around Minsk (small radius)
  const center = { lat: 53.9, lng: 27.5 };
  const zoom = 10;
  const radius = 1; // 3x3 grid = 9 tiles

  console.log(`Center: ${center.lat}, ${center.lng}`);
  console.log(`Zoom: ${zoom}`);
  console.log(`Radius: ${radius} tiles\n`);

  const tiles = TileDownloader.getTilesInBounds(center, zoom, radius);
  console.log(`Tiles to download: ${tiles.length}`);
  console.log('Tile coordinates:');
  tiles.forEach((t, i) => console.log(`  ${i + 1}. x=${t.x}, y=${t.y}, z=${t.z}`));

  const downloader = new TileDownloader('osm', {
    maxConcurrency: 3,
    outputDir: './test-tiles',
    onProgress: (completed, total) => {
      process.stdout.write(`\rProgress: ${completed}/${total} (${((completed/total)*100).toFixed(1)}%)`);
    },
    onTileDownloaded: (coords, filePath) => {
      console.log(`\nSaved: ${filePath}`);
    }
  });

  console.log('\n\nDownloading tiles...');
  const result = await downloader.downloadTiles(tiles);

  console.log('\n\n=== Results ===');
  console.log(`Success: ${result.success}`);
  console.log(`Failed: ${result.failed}`);

  // Verify tile files exist and check numbering
  const fs = require('fs');
  const path = require('path');
  
  const tileDir = path.join('./test-tiles', 'osm', zoom.toString());
  
  if (fs.existsSync(tileDir)) {
    const xDirs = fs.readdirSync(tileDir);
    console.log(`\nX directories: ${xDirs.join(', ')}`);
    
    let totalFiles = 0;
    for (const xDir of xDirs) {
      const yDir = path.join(tileDir, xDir);
      if (fs.statSync(yDir).isDirectory()) {
        const files = fs.readdirSync(yDir);
        console.log(`X=${xDir}: Y tiles = [${files.join(', ')}]`);
        totalFiles += files.length;
      }
    }
    console.log(`\nTotal tile files: ${totalFiles}`);
    console.log(`Expected: ${tiles.length}`);
    console.log(`Match: ${totalFiles === tiles.length ? 'YES ✓' : 'NO ✗'}`);
  } else {
    console.log('ERROR: Tile directory not found!');
  }

  // Test 2: Test coordinate conversion
  console.log('\n=== Coordinate Conversion Test ===');
  const testCoords = { x: 543, y: 332, z: 10 };
  const latLng = TileDownloader.tileToLatLng(testCoords.x, testCoords.y, testCoords.z);
  console.log(`Tile ${testCoords.x}, ${testCoords.y}, ${testCoords.z} -> Lat: ${latLng.lat.toFixed(4)}, Lng: ${latLng.lng.toFixed(4)}`);
  
  const backToTile = TileDownloader.latLngToTile(latLng.lat, latLng.lng, testCoords.z);
  console.log(`Back to tile: x=${backToTile.x}, y=${backToTile.y}, z=${backToTile.z}`);
  console.log(`Match: ${backToTile.x === testCoords.x && backToTile.y === testCoords.y ? 'YES ✓' : 'NO ✗'}`);

  console.log('\n=== All tests completed ===');
}

test().catch(console.error);
