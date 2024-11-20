import { fetchData } from './fetch.js';
import { provincias } from './provincias.js';
import { TerritoryTree } from './Territory.js';

const eurostatUrl = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_r_d2jan/?format=JSON&lang=en&freq=A&unit=NR&sex=T&age=TOTAL&time=2023';
const ineUrl = 'https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/61398?tv=Sexo:ambossexos';

async function buildDataset() {
  let data;

  const eurostatData = await fetchData(eurostatUrl, 'eurostat');
  const ineData = await fetchData(ineUrl, 'ine');

  // Process Eurostat data

  const territories = new TerritoryTree('Europe', 'EU27_2020');

  const geoLabels = eurostatData.dimension.geo.category.label;
  const index = eurostatData.dimension.geo.category.index;
  const values = eurostatData.value;

  for (const geoCode in geoLabels) {
    const regionName = geoLabels[geoCode];
    const value = values[index[geoCode]] || 0;

    if (geoCode.length === 2) {
      territories.addNode(regionName, geoCode, value, 'EU27_2020');
    } else if (geoCode.length === 3) {
      const parentId = geoCode.slice(0, 2);
      territories.addNode(regionName, geoCode, value, parentId);
    } else if (geoCode.length === 4) {
      const parentId = geoCode.slice(0, 3);
      territories.addNode(regionName, geoCode, value, parentId);
    }
  }

  // Process INE data

  provincias.forEach(provincia => {
    territories.addNode(provincia.label, provincia.code, 0, provincia.parent_code);
  });

  

  ineData.forEach(d => {
    const trimmedName = d.Nombre.replace(/, Ambos sexos$/, '');
    const match = trimmedName.match(/^(\d{5})\s(.+)$/);
    
    if (match) {
      const [_, municipalityId, municipalityName] = match;
      const parentId = municipalityId.slice(0, 2);
      const value = d.Data.filter(d => d.NombrePeriodo === "2023")[0].Valor;

      territories.addNode(municipalityName, municipalityId, value, parentId);
    }    
  });

  territories.clean();
  process.stdout.write(JSON.stringify(territories.root, null, 2));
}

buildDataset();