#!/usr/bin/env node

import * as process from 'process';
import { TileDownloader, TileProviderFactory, BoundingBox, ProviderName } from './index';

interface CliArgs {
  provider: string;
  zoom: number;
  bounds?: BoundingBox;
  lang: string;
  concurrency: number;
  outputDir: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const provider = args[0];
  const supported = TileProviderFactory.getSupportedProviders();
  
  if (!supported.includes(provider)) {
    console.error(`Error: Provider "${provider}" is not supported.`);
    console.error(`Supported providers: ${supported.join(', ')}`);
    process.exit(1);
  }

  const zoom = parseInt(args[1]);
  if (isNaN(zoom) || zoom < 0 || zoom > 19) {
    console.error('Error: Zoom must be a number between 0 and 19');
    process.exit(1);
  }

  let bounds: BoundingBox | undefined;
  if (args[2]) {
    try {
      bounds = JSON.parse(args[2]);
    } catch {
      console.error('Error: Invalid bounds JSON');
      process.exit(1);
    }
  }

  const lang = args[3] || 'ru';
  const concurrency = parseInt(args[4]) || 6;
  const outputDir = args[5] || 'tiles';

  return { provider, zoom, bounds, lang, concurrency, outputDir };
}

function printUsage(): void {
  console.log(`
Usage: tiles-download <provider> <zoom> [bounds] [lang] [concurrency] [outputDir]

Arguments:
  provider     - Map provider: google, yandex, osm, bing
  zoom         - Zoom level (0-19)
  bounds       - Optional: JSON object with north, south, west, east
  lang         - Optional: Language code (default: ru)
  concurrency  - Optional: Max concurrent downloads (default: 6)
  outputDir    - Optional: Output directory (default: tiles)

Examples:
  tiles-download google 10
  tiles-download google 10 null ru 6
  tiles-download google 15 '{"north": 56.2, "south": 51.2, "west": 23.2, "east": 32.8}' ru 10
  `);
}

async function main(): Promise<void> {
  const args = parseArgs();

  const downloader = new TileDownloader(args.provider as ProviderName, {
    lang: args.lang,
    maxConcurrency: args.concurrency,
    outputDir: args.outputDir,
    onProgress: (completed, total) => {
      const percent = ((completed / total) * 100).toFixed(2);
      process.stdout.write(`\rProgress: ${percent}% (${completed}/${total})`);
    },
  });

  console.log(`Downloading tiles from ${args.provider} at zoom ${args.zoom}`);
  console.log(`Output directory: ${args.outputDir}`);

  const startTime = Date.now();

  if (args.bounds) {
    const result = await downloader.downloadArea(args.bounds, args.zoom);
    console.log(`\n\nDownload complete!`);
    console.log(`Success: ${result.success}, Failed: ${result.failed}`);
  } else {
    const coords = TileDownloader.getTilesInBounds({ lat: 53.9, lng: 27.5 }, args.zoom, 2);
    const result = await downloader.downloadTiles(coords);
    console.log(`\n\nDownload complete!`);
    console.log(`Success: ${result.success}, Failed: ${result.failed}`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Time: ${duration}s`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
