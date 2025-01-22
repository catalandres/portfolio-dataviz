--- 
theme: "dashboard"
toc.show: false
---

# PSSA 2024

## Notes mitjanes


```js
const data = await FileAttachment("data/pssa/pssa-2024.json").json();
const counties = await FileAttachment("data/pssa/pa-counties-2024.json").json();

const subjects = Array.from(new Set(data.results.map(r => r.subject)));
const grades = Array.from(new Set(data.results.map(r => r.grade)))
  .filter(g => g !== "Total")  // Excloem el "Total" si volem
  .sort((a, b) => a - b);  // Ordenem numèricament
```

```js
const subjectInput = Inputs.select(new Map([
      ["Llengua anglesa", "English Language Arts"],
      ["Matemàtiques", "Math"],
      ["Ciències", "Science"]
    ]), {
  label: "Assignatura", 
  value: ["English Language Arts", "Math", "Science"],
  multiple: true
});
const subject = Generators.input(subjectInput);

const gradeInput = Inputs.select(new Map([
        ["3r", 3],
        ["4t", 4],
        ["5è", 5],
        ["6è", 6],
        ["7è", 7],
        ["8è", 8]
]), {
  label: "Grau",
  value: [3, 4, 5, 6, 7, 8],
  multiple: true
});
const grade = Generators.input(gradeInput);
```

```js
const countyAverages = Object.entries(
  filteredData.reduce((acc, row) => {
    const school = data.metadata.schools[row.school];
    const county = school.county;
    const type = school.type;  // 'public' o 'charter'
    
    // Inicialitzem l'objecte pel comtat si no existeix
    if (!acc[county]) {
      acc[county] = {
        total: { totalStudents: 0, weightedSum: 0 },
        public: { totalStudents: 0, weightedSum: 0 },
        charter: { totalStudents: 0, weightedSum: 0 }
      };
    }

    acc[county].total.totalStudents += row.metrics.total;
    acc[county].total.weightedSum += row.metrics.avgScore * row.metrics.total;

    acc[county][type].totalStudents += row.metrics.total;
    acc[county][type].weightedSum += row.metrics.avgScore * row.metrics.total;
    
    return acc;
  }, {})
).reduce((acc, [county, data]) => ({
  ...acc,
  [county]: {
    total: data.total.totalStudents > 0 
      ? data.total.weightedSum / data.total.totalStudents 
      : null,
    public: data.public.totalStudents > 0 
      ? data.public.weightedSum / data.public.totalStudents 
      : null,
    charter: data.charter.totalStudents > 0 
      ? data.charter.weightedSum / data.charter.totalStudents 
      : null,
    difference: 
      data.public.totalStudents > 0 && data.charter.totalStudents > 0 && (data.charter.weightedSum / data.charter.totalStudents) >= 1
        ? (data.charter.weightedSum / data.charter.totalStudents) - 
          (data.public.weightedSum / data.public.totalStudents)
        : null
  }
}), {});
```

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

<div class="grid grid-cols-2 card">
  <div>${subjectInput}</div>
  <div>${gradeInput}</div>
</div>

```js
const filteredData = data.results.filter(d => 
    grade.includes(d.grade)
    && subject.includes(d.subject)
    && d.group === "All Students"
);
```

<div class="grid grid-cols-2">
<div class="card">

```js
Plot.plot({
  title: "Nota mitjana als examens PSSA de 2024",
  subtitle: "Per comtat, per a les assignatures i graus seleccionats",
  padding: 0,
  projection: {
    type: "mercator",
    domain: counties,
  },
  color: {
    type: "linear",
    scheme: "Cubehelix",
    legend: true,
    label: "Nota mitjana",
    domain: [1, 4],
    unknown: "#ccc"
  },
  marks: [
    Plot.geo(counties, {
      fill: d => countyAverages[d.properties.COUNTY_NAM].total || null,
      stroke: "white",
      strokeWidth: 0.5,
      title: d => {
        const avg = countyAverages[d.properties.COUNTY_NAM].total;
        return avg != null 
          ? `${d.properties.COUNTY_NAM}: ${avg.toFixed(2)}`
          : `${d.properties.COUNTY_NAM}: No data`;
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
  title: "Diferència de notes mitjanes entre escoles públiques i concertades",
  subtitle: "Per comtat, per a les assignatures i graus seleccionats",
  padding: 0,
  projection: {
    type: "mercator",
    domain: counties,
  },
  color: {
    type: "diverging",
    scheme: "Spectral",
    legend: true,
    label: "Diferencial de nota mitjana",
    domain: [-1.5, 1.5],
    unknown: "#eee"
  },
  marks: [
    Plot.geo(counties, {
      fill: d => countyAverages[d.properties.COUNTY_NAM].difference || null,
      stroke: "#aaa",
      strokeWidth: 0.5,
      title: d => {
        const avg = countyAverages[d.properties.COUNTY_NAM].difference;
        return avg != null 
          ? `${d.properties.COUNTY_NAM}: ${avg.toFixed(2)}`
          : `${d.properties.COUNTY_NAM}: No data`;
      }
    }),
    Plot.geo(
      counties.features.filter(d => 
        ["ALLEGHENY", "PHILADELPHIA", "LEHIGH", "DAUPHIN"].includes(d.properties.COUNTY_NAM)
      ), {
        fill: "none",
        stroke: "#aaa",
        strokeWidth: 2
    })
  ]
})
```

</div>
</div>

<div class="grid grid-cols-2 card">

${Inputs.table(
    Object.entries(countyAverages).map(([key, value]) => ({
      county: key,
      total: value.total,
      public: value.public,
      charter: value.charter >= 1 ? value.charter : null,
      difference: value.difference
    })),
    {
        select: false,
        header: {
            county: "Comtat",
            total: "Nota mitjana",
            public: "Escoles públiques",
            charter: "Escoles concertades",
            difference: "Diferencial"
        },
        width: 1024,
        format: {
            total: sparkbar(d3.max(Object.values(countyAverages).map(d => d.total))),
            public: sparkbar(d3.max(Object.values(countyAverages).map(d => d.public))),
            charter: sparkbar(d3.max(Object.values(countyAverages).map(d => d.charter)))
        },
        layout: "auto"
    }
)}

</div>
