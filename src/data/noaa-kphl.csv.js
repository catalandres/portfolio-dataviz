import { csvFormat } from "d3-dsv";
import { fetchData } from "./fetch.js";

const today = new Date().toISOString().split('T')[0];
const noaaUrl = `https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&dataTypes=TMAX,TMIN&stations=USW00013739&startDate=1940-07-01&endDate=${today}&includeAttributes=true&format=json`;


const data = await fetchData(noaaUrl, 'noaa');

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const temperatures = data.map(d => {
    const date = new Date(d.DATE);
    const month = months[date.getMonth()];
    const decade = `${Math.floor(date.getUTCFullYear() / 10) * 10}s`;
    const maxTemperature = Math.round((parseFloat(d.TMAX) * 9/50) + 32);
    const minTemperature = Math.round((parseFloat(d.TMIN) * 9/50) + 32);
    return [
        {
            date: d.DATE,
            temperature: maxTemperature,
            month: month,
            decade: decade,
            type: "max"
        },
        {
            date: d.DATE,
            temperature: minTemperature,
            month: month,
            decade: decade,
            type: "min"
        }
    ];
}).flat();

process.stdout.write(csvFormat(temperatures));