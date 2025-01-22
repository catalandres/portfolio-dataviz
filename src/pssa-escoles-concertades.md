--- 
theme: "dashboard"
toc.show: false
---

# PSSA 2024

## Escoles públiques i concertades a Pensilvània

```js
const data = await FileAttachment("data/pssa/pssa-2024.json").json();
const counties = await FileAttachment("data/pssa/pa-counties-2024.json").json();

const countyRanking = Object.entries(data.metadata.counties)
  .map(([county, stats]) => ({county, total: stats.totalSchools, charter: stats.charterSchools, pct: stats.charterSchools / stats.totalSchools * 100.0}))
  .sort((a, b) => b.total - a.total);

const cat = d3.formatLocale({
  thousands: ",",
  grouping: [3],
  currency: ["", "%"]
});
```

<div class="grid grid-cols-2">
<div class="card">

```js
Plot.plot({
  title: "Concentració de centres escolars a Pensilvània",
  subtitle: "Per comtat",
  padding: 0,
  projection: {
    type: "mercator",
    domain: counties,
  },
  color: {
    type: "linear",
    scheme: "Viridis",
    legend: true,
    label: "Total d'escoles",
    domain: [0, 250]
  },
  marks: [
    Plot.geo(counties, {
      fill: d => data.metadata.counties[d.properties.COUNTY_NAM]?.totalSchools || 0,
      stroke: "white",
      strokeWidth: 0.5,
      title: d => {
        const stats = data.metadata.counties[d.properties.COUNTY_NAM];
        return stats 
          ? `${d.properties.COUNTY_NAM}: ${stats.totalSchools} escoles, ${stats.charterSchools} concertades (${Math.round(stats.charterSchools / stats.totalSchools * 100000)/1000}%)`
          : `${d.properties.COUNTY_NAM}: sense dades`;
      }
    }),
    Plot.geo(
      counties.features.filter(d => 
        ["ALLEGHENY", "PHILADELPHIA", "LEHIGH", "DAUPHIN"].includes(d.properties.COUNTY_NAM)
      ), {
        fill: "none",
        stroke: "white",
        strokeWidth: 2
    })
  ]
})
```

</div>
<div class="card">

```js
Plot.plot({
  title: "Percentatge de centres escolars concertats a Pensilvània",
  subtitle: "Per comtat",
  padding: 0,
  projection: {
    type: "mercator",
    domain: counties,
  },
  color: {
    type: "linear",
    scheme: "Cubehelix",
    legend: true,
    label: "Percentatge d'escoles concertades",
    tickFormat: cat.format("$.0f"),
    domain: [0, 40],
    unknown: "#999"
  },
  marks: [
    Plot.geo(counties, {
      fill: d => data.metadata.counties[d.properties.COUNTY_NAM]?.charterSchools / data.metadata.counties[d.properties.COUNTY_NAM]?.totalSchools * 100.0 || null,
      stroke: "#eee",
      strokeWidth: 0.5,
      title: d => {
        const stats = data.metadata.counties[d.properties.COUNTY_NAM];
        return stats 
          ? `${d.properties.COUNTY_NAM}: ${stats.totalSchools} escoles, ${stats.charterSchools} concertades (${Math.round(stats.charterSchools / stats.totalSchools * 100000)/1000}%)`
          : `${d.properties.COUNTY_NAM}: sense dades`;
      }
    }),
    Plot.geo(
      counties.features.filter(d => 
        ["ALLEGHENY", "PHILADELPHIA", "LEHIGH", "DAUPHIN"].includes(d.properties.COUNTY_NAM)
      ), {
        fill: "none",
        stroke: "#eee",
        strokeWidth: 2
    })
  ]
})
```

</div>
</div>

<div class="grid grid-cols-1">
<div class="card">

```js
function sparkbar(max) {
  return (x) => htl.html`<div style="
    background: var(--theme-yellow);
    color: black;
    font: 10px/1.6 var(--sans-serif);
    width: ${100 * x / max}%;
    float: right;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;">${x.toLocaleString("en-US")}`
}
```

${Inputs.table(
    countyRanking,
    {
        select: false,
        header: {
            county: "Comtat",
            total: "Escoles",
            charter: "Concertades",
            pct: "Percentatge"
        },
        maxWidth: 1024,
        format: {
            total: sparkbar(d3.max(countyRanking, d => d.total)),
            charter: sparkbar(d3.max(countyRanking, d => d.charter)),
            pct: sparkbar(d3.max(countyRanking, d => d.pct)),
        },
        layout: "fixed"
    }
)}

</div>
</div>