# 2023 Pennsylvania Crash Data

El Departament de Transports de la mancomunitat de Pensilvània (PennDOT) recopila dades sobre accidents de trànsit a tot l'estat. Aquestes dades inclouen informació sobre la ubicació, el nombre de vehicles involucrats, el nombre de persones ferides i el nombre de persones mortes. Aquesta visualització mostra tots els accidents de trànsit ocorreguts a Pensilvània durant l'any 2023 (més de 110&nbsp;000), fent servir la longitud i la latitud de l'event per a donar un context geogràfic al conjunt de les dades.

## Visualització

```js
const data = FileAttachment("data/penndot.json").json();
```

```js
import {paCounties} from "./data/pa-counties.js";
const counties = Object.values(paCounties);
counties.sort()
```

```js
const countyInput = Inputs.select(["Tots", ...counties], {label: "Comtat", value: "Tots"});
const county = Generators.input(countyInput);
const facetInput = Inputs.radio(new Map([
      ["Comtat", "county"],
      ["Velocitat límit", "speedLimit"],
      ["Entorn", "urbanRural"]
    ]), {label: "Capa de color", value: "county"});
const facet = Generators.input(facetInput);
```

```js
const filteredData = data.filter(d => d.county === county || county === "Tots");
```

```js
var dotRadius = Math.min(6000/filteredData.length,1.5);
var colorScheme = {
    scheme: facet === "urbanRural" ? "warm" : "turbo",
    type: facet === "speedLimit" ? "sequential" : "categorical",
    legend: facet !== "county"
};
```

<div class="grid grid-cols-2">
  <div class="card">
    ${countyInput}
  </div>
  <div class="card">
    ${facetInput}
  </div>
</div>

<div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
${
    resize((width) => Plot.plot(
        {
            grid: true,
            width: width,
            aspectRatio: 1,
            color: colorScheme,
            x: {label: "Longitud"},
            y: {label: "Latitud"},
            fy: {label: "Comtat"},
            marks: [
                Plot.dot(filteredData, {x: "longitude", y: "latitude", stroke: facet, fill: facet, r: dotRadius, tip: true,
                        channels: {
                            county: {value: "county", label: "comtat"},
                            speedLimit: {value: "speedLimit", label: "velocitat límit"},
                            fatalCount: {value: "fatalCount", label: "morts"},
                            injuryCount: {value: "injuryCount", label: "ferits"},
                            personCount: {value: "personCount", label: "persones"},
                            vehicleCount: {value: "vehicleCount", label: "vehicles"},
                            urbanRural: {value: "urbanRural", label: "entorn"}
                        },})
            ]
        }
    ))
}
</div>

## Dades visualitzades

<div class="card" style="padding: 10px;">
    ${Inputs.table(
        filteredData,
        {
            select: false,
            header: {
                latitude: "Latitud",
                longitude: "Longitud",
                county: "Comtat",
                speedLimit: "Velocitat límit",
                fatalCount: "Morts",
                injuryCount: "Ferits",
                personCount: "Persones",
                vehicleCount: "Vehicles",
                urbanRural: "Entorn"
            }
    })}
</div>

## Conjunt de dades

El PennDOT publica annualment un conjunt de dades [a un portal de dades obertes](https://pennshare.maps.arcgis.com/apps/webappviewer/index.html?id=8fdbf046e36e41649bbfd9d7dd7c7e7e) hostatjat al servei online d'ArcGIS. Les dades es poden descarregar com un arxiu comprimit que conté diversos arxius CSV amb les dades dels accidents així com les dades associades, per poder reconstruir, si s'escau, una base de dades que permeti reflectir de forma fidedigna la cardinalitat entre les entitats: per exemple, un accident pot involucrar múltiples vehicles, múltiples persones o múltiples carreteres.

En el nostre cas, hem fet servir les taules `CRASH` i `ROADWAY` per obtenir les dades de localització i les dades associades a cada accident. Hem fet servir el camp `CRN` per a poder fer el _join_ entre les dues taules. Com que es tracta d'un conjunt de dades molt gran (l'arxiu comprimit pesa més de 180 MB) i estàtic, hem optat per descarregar les dades i incloure-les directament al nostre repositori (arxius `CRASH_2023.csv` i `ROADWAY_2023.csv`).

Per obtenir un conjunt de dades més lleuger i fàcil de manipular, hem creat un _data loader_ dins d'Observable Framework que pren les dues taules com a matèria primera i les combina en un sol objecte JSON que conté totes les dades necessàries per a la visualització. Podeu trobar el codi a `data/penndot.json.js`.

## Referències

- _Pennsylvania Department of Transportation_: [_Crash Data_](https://pennshare.maps.arcgis.com/apps/webappviewer/index.html?id=8fdbf046e36e41649bbfd9d7dd7c7e7e)
    - [Dades de 2023](https://gis.penndot.gov/gishub/crashZip/Statewide/Statewide_2023.zip) per a tot l'estat de Pensilvània (⚠️ 180.4 MB)
    - [Diccionari de dades](https://gis.penndot.gov/gishub/crashZip/Open%20Data%20Portal%20Data%20Dictionary%20(07-24).pdf)
