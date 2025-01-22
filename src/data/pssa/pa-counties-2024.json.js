import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const geojsonPath = fileURLToPath(import.meta.resolve("./PaCounty2024_11.geojson"));
const geojson = await readFile(geojsonPath, 'utf-8');

process.stdout.write(geojson);