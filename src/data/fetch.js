import { readFileSync, readdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

async function fetchData(url, prefix) {
    const today = new Date().toISOString().split('T')[0];
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const dataFolderPath = join(__dirname);
    const todayFilePath = join(__dirname, `${prefix}-${today}.json`);
    let data;

    try {
        const todayFileContent = readFileSync(todayFilePath, 'utf-8');
        data = JSON.parse(todayFileContent);
    } catch (error) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        data = await response.json();
        writeFileSync(todayFilePath, JSON.stringify(data, null, 2));
      } catch (fetchError) {
        const files = readdirSync(dataFolderPath).filter(file => file.startsWith(prefix) && file.endsWith('.json'));
        if (files.length === 0) throw new Error('No cached data files available');
        files.sort((a, b) => b.localeCompare(a));
        const latestFilePath = join(dataFolderPath, files[0]);
        const latestFileContent = readFileSync(latestFilePath, 'utf-8');
        data = JSON.parse(latestFileContent);
      }
    }

    const files = readdirSync(dataFolderPath).filter(file => file.startsWith(prefix) && file.endsWith('.json'));
    files.sort((a, b) => b.localeCompare(a));
    for (let i = 1; i < files.length - 1; i++) {
      unlinkSync(join(dataFolderPath, files[i]));
    }

    return data;
}

export { fetchData };