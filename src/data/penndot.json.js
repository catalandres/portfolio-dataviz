import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { paCounties } from './pa-counties.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const crashFile = readFileSync(join(__dirname, 'CRASH_2023.csv'), 'utf-8');
const roadwayFile = readFileSync(join(__dirname, 'ROADWAY_2023.csv'), 'utf-8');

const rawCrashData = parse(crashFile, {
  columns: true,
  skip_empty_lines: true
});

const rawRoadwayData = parse(roadwayFile, {
  columns: true,
  skip_empty_lines: true
});

const speedLimitsByCrn = rawRoadwayData.reduce((acc, row) => {
  const crn = row.CRN;
  const speedLimit = parseFloat(row.SPEED_LIMIT);

  if (!acc[crn]) {
    acc[crn] = { total: 0, count: 0 };
  }

  acc[crn].total += speedLimit;
  acc[crn].count += 1;

  return acc;
}, {});

const averageSpeedLimits = Object.fromEntries(
  Object.entries(speedLimitsByCrn).map(([crn, { total, count }]) => [crn, total / count])
);

const data = rawCrashData
  .filter(d => parseFloat(parseFloat(d.DEC_LAT).toFixed(3)) % 1 !== 0 && parseFloat(parseFloat(d.DEC_LONG).toFixed(3)) % 1 !== 0)
  .filter(d => (d.COUNTY === "03" && d.DEC_LONG > -79.8) || d.COUNTY !== "03")
  .filter(d => (d.COUNTY === "19" && d.DEC_LAT > 40.5) || d.COUNTY !== "19")
  .filter(d => (d.COUNTY === "25" && d.DEC_LONG < -79) || d.COUNTY !== "25")
  .filter(d => (d.COUNTY === "42" && d.DEC_LONG < -78) || d.COUNTY !== "42")
  .filter(d => (d.COUNTY === "44" && d.DEC_LONG < -77) || d.COUNTY !== "44")
  .filter(d => (d.COUNTY === "44" && d.DEC_LONG > -78) || d.COUNTY !== "44")
  .filter(d => (d.COUNTY === "62" && d.DEC_LONG < -79.5) || d.COUNTY !== "62")
  .filter(d => d.DEC_LAT !== "0" && d.DEC_LONG !== "0")
  .map(d => {
    return {
      latitude: parseFloat(d.DEC_LAT),
      longitude: parseFloat(d.DEC_LONG),
      county: paCounties[d.COUNTY],
      speedLimit: averageSpeedLimits[d.CRN] || 0,
      fatalCount: parseInt(d.FATAL_COUNT),
      injuryCount: parseInt(d.INJURY_COUNT),
      personCount: parseInt(d.PERSON_COUNT),
      vehicleCount: parseInt(d.VEHICLE_COUNT),
      urbanRural: d.URBAN_RURAL === "1" ? "Rural" : "Urban",
    }
  });

process.stdout.write(JSON.stringify(data, null, 2));