# Temperatures màximes i mínimes diàries a Filadèlfia (1940-2024)

Els [Centres Nacionals per a la Informació Ambiental (NCEI)](https://www.ncei.noaa.gov) de l'Administració Nacional Oceànica i Atmosfèrica (NOAA) és un servei públic d'informació meteorològica i ambiental. La NOAA disposa d'una xarxa de més de 15 000 estacions meteorològiques al llarg i amble dels Estats Units per a recollir dades per a la recerca científica, la planificació de la infraestructura, la gestió dels recursos naturals, entre d'altres propòsits.

Una de les sèries temporals que publiquen els NCEI són els _Daily Summaries_: dades diàries de temperatura, precipitació, humitat i velocitat del vent, entre d'altres. L'estació més propera a on resideix l'autor és la de l'aeroport internacional de Filadèlfia (anomenada KPHL), que ha estat en funcionament des de juliol de l'any 1940.

En aquesta visualització mostrem les temperatures màximes i mínimes registrades a l'estació KPHL des de la seva posada en marxa fins a l'actualitat. Hem confeccionat un _ridgeline plot_ que mostra la distribució de les temperatures màximes i mínimes, agrupades per mesos o per dècades. Això ens permetrà entendre l'evolució de les temperatures extremes al llarg del temps, així com l'estacionalitat.

## Visualització

```js
const temperatures = FileAttachment("data/noaa-kphl.csv").csv({typed: true, array: false});
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const decades = ["1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
const decadeInput = Inputs.radio(["Tots", ...decades], {value: "Tots", label: "Dècada"});
const decade = Generators.input(decadeInput);
const monthInput = Inputs.select(["Tots", ...months], {value: "Tots", label: "Mes"});
const month = Generators.input(monthInput);
const sliceByInput = Inputs.radio(new Map([
      ["Mesos", "month"],
      ["Dècades", "decade"]]), {value: "month", label: "Agrupat per"});
const sliceBy = Generators.input(sliceByInput);
```

```js
const maxTemperature = Math.ceil(d3.max(temperatures, d => d.temperature));
const minTemperature = Math.floor(d3.min(temperatures, d => d.temperature));
const temperatureRange = d3.range(minTemperature, maxTemperature + 1);
const filteredData = temperatures.filter((d) => (d.decade === decade || decade === "Tots") && (d.month === month || month === "Tots"))
```

```js
var domainSet = [];
var rangeY = [];

if (sliceBy === "month") {
    if (month === "Tots") {
        domainSet = months;
        rangeY = [100,-75];
    } else {
        domainSet = [month];
        rangeY = [250,0];
    }
} else {
    if (decade === "Tots") {
        domainSet = decades;
        if (month === "Tots") {
            rangeY = [100,-20];
        } else {
            rangeY = [120,-60];
        }
    } else {
        domainSet = months;
        rangeY = [250,0];
    }
}
```

<div class="grid grid-cols-3">
  <div class="card">
    ${decadeInput}
  </div>
  <div class="card">
    ${monthInput}
  </div>
  <div class="card">
    ${sliceByInput}
  </div>
</div>

<div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
${resize((width) => Plot.plot({
    width,
    marginTop: 0,
    marginBottom: 35,
    marginLeft: 100,
    x: {axis: "bottom", label: "Temperatura (°F)", domain: [minTemperature, maxTemperature], grid: true},
    y: {axis: null, range: rangeY},
    fy: {label: null, domain: domainSet}, // preserve input order
    marks: [
        Plot.areaY(
            filteredData.filter((d) => d.type === "max"),
            Plot.binX(
                {y: "count"},
                {x: "temperature", fy: sliceBy, fill: "red", fillOpacity: 0.5, thresholds:temperatureRange},
                {curve: "basis"},
            ),
        ),
        Plot.areaY(
            filteredData.filter((d) => d.type === "min"),
            Plot.binX(
                {y: "count"},
                {x: "temperature", fy: sliceBy, fill: "blue", fillOpacity: 0.5, thresholds:temperatureRange},
                {curve: "basis"}
            ),
        ),
    ]
}))}
</div>

## Dades visualitzades

<div class="card" style="padding: 10px;">
    ${
        Inputs.table(filteredData, {
            select: false,
            header: {
                date: "Data",
                temperature: "Temperatura",
                month: "Mes",
                decade: "Dècada",
                type: "Tipus de temperatura",
            }
        })
    }
</div>

## Conjunt de dades

[La sèrie de dades utilitzada en aquesta visualització](https://www.ncei.noaa.gov/access/search/data-search/daily-summaries?dataTypes=TAVG&pageNum=1&bbox=40.100,-75.315,39.802,-75.017) es pot accedir mitjançant la API de l'NCEI. La URL de la API per a obtenir les temperatures màximes a l'estació KPHL és la següent:

[`https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&dataTypes=TMAX&stations=USW00013739&startDate=1940-07-01&endDate=2024-11-01&includeAttributes=true&format=json`](https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&dataTypes=TMAX&stations=USW00013739&startDate=1940-07-01&endDate=2024-11-01&includeAttributes=true&format=json)

El _data loader_ per obtenir el conjunt de dades es pot trobar a `data/noaa-kphl.csv`.

## Referències

- National Oceanic and Atmospheric Administration: [Daily Summaries](https://www.ncei.noaa.gov/access/search/data-search/daily-summaries?dataTypes=TAVG&pageNum=1&bbox=40.100,-75.315,39.802,-75.017).