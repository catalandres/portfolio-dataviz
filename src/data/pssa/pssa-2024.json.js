import ExcelJS from 'exceljs';
import {fileURLToPath} from 'node:url';

// Llegim l'Excel
const excelPath = fileURLToPath(import.meta.resolve("./2024-pssa-school-data.xlsx"));
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(excelPath);

// Obtenim el primer full
const worksheet = workbook.getWorksheet(1);

// Obtenim els noms de les columnes
const headers = worksheet.getRow(5).values;

// Estructura per les estadístiques per comtat
const countyStats = {};

// Processem les dades
const result = {
    metadata: {
        schools: {},
        counties: {}
    },
    results: []
};

// Processem cada fila
worksheet.eachRow((row, rowNumber) => {
    // Saltem les primeres files (capçalera)
    if (rowNumber <= 5) return;
    
    const values = row.values;
    const rowData = {};
    headers.forEach((header, i) => {
        if (header) rowData[header] = values[i];
    });
    
    const schoolId = `${rowData.AUN}-${rowData['School Number']}`;
    const county = rowData.County;
    
    // Afegim l'escola si no existeix
    if (!result.metadata.schools[schoolId]) {
        result.metadata.schools[schoolId] = {
            name: rowData['School Name'],
            district: rowData['District Name'],
            county: county,
            type: rowData['District Name'].endsWith(' SD') ? 'public' : 'charter'
        };

        if (!result.metadata.counties[county]) {
            result.metadata.counties[county] = {
                totalSchools: 0,
                publicSchools: 0,
                charterSchools: 0
            };
        }
        result.metadata.counties[county].totalSchools++;
        if (result.metadata.schools[schoolId].type === 'charter') {
            result.metadata.counties[county].charterSchools++;
        } else {
            result.metadata.counties[county].publicSchools++;
        }
    }
    
    // Afegim els resultats
    result.results.push({
        school: schoolId,
        subject: rowData.Subject,
        grade: rowData.Grade,
        group: rowData.Group,
        metrics: {
            total: rowData['Number Scored'],
            advanced: rowData['Percent Advanced'],
            proficient: rowData['Percent Proficient'],
            basic: rowData['Percent Basic'],
            belowBasic: rowData['Percent Below Basic'],
            proficientAndAbove: rowData['Percent Proficient and above'],
            avgScore: (
                rowData['Percent Advanced'] * 4 + 
                rowData['Percent Proficient'] * 3 + 
                rowData['Percent Basic'] * 2 + 
                rowData['Percent Below Basic']
            ) / 100
        }
    });
});

// Enviem el JSON a stdout
process.stdout.write(JSON.stringify(result, null, 2));