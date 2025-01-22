--- 
theme: "dashboard"
toc.show: false
---

# PSSA 2024

## Notes mitjanes, comtats i extracció racial


```js
import {paCounties} from "./data/pa-counties.js";
const countyList = Object.values(paCounties);
countyList.sort()
```


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

const countyInput = Inputs.select(["Tots", ...countyList], {label: "Comtat", value: "Tots"});
const county = Generators.input(countyInput);
```

<div class="card">
<div class="grid grid-cols-2">
  <div>${subjectInput}</div>
  <div>${gradeInput}</div>
</div>
<div class="grid grid-cols-2">
  <div>${countyInput}</div>
  <div></div>
</div>
</div>

```js
const filteredData = data.results.filter(d => 
    grade.includes(d.grade)
    && subject.includes(d.subject)
    && ["All Students", "White (not Hispanic)"].includes(d.group)
    && (data.metadata.schools[d.school].county === county || county === "Tots")
);
```

```js
const schoolStats = filteredData
 .reduce((schoolsMap, record) => {
   const schoolId = record.school;
   
   const currentStats = schoolsMap.get(schoolId) || {
     name: data.metadata.schools[schoolId].name,
     type: data.metadata.schools[schoolId].type,
     county: data.metadata.schools[schoolId].county,
     totalStudents: 0,
     whiteStudents: 0,
     scoreSum: 0,
     avgScore: 0,
     pctWhite: 0
   };

    const newScoreSum = currentStats.scoreSum + record.metrics.avgScore * record.metrics.total;
    const newTotalStudents = currentStats.totalStudents + record.metrics.total;
    const newWhiteStudents = currentStats.whiteStudents + record.metrics.total;

   return schoolsMap.set(
     schoolId,
     record.group === "All Students"
       ? {
            ...currentStats,
            scoreSum: newScoreSum,
            totalStudents: newTotalStudents,
            avgScore: newTotalStudents > 0 ? newScoreSum / newTotalStudents : 0,
            pctWhite: currentStats.whiteStudents / newTotalStudents * 100
         }
       : {
           ...currentStats,
           whiteStudents: newWhiteStudents,
           pctWhite: newWhiteStudents / currentStats.totalStudents * 100
         }
   );
 }, new Map());
```

<div class="grid grid-cols-1 card">

```js
Plot.plot({
  title: "Distribució de notes mitjanes per tipus d'escola i percentatge de població estudiantil blanca",
  subtitle: "Per escola, per a les assignatures, graus i estat seleccionats",
  padding: 0,
 width: 1680,
 height: 600,
 grid: true,
 x: {
   label: "Percentatge d'estudiants blancs",
   domain: [0, 100],
   ticks: d3.range(0, 101, 10) 
 },
 y: {
   label: "Nota mitjana",
   domain: [1, 4],
   ticks: d3.range(1, 4.01, 1)
 },
 marks: [
   Plot.dot(Array.from(schoolStats.values()).filter(d => d.avgScore >= 1).sort((a, b) => a.type === 'charter' ? 1 : -1), {
     x: d => (Math.floor(Math.min(99.99, d.pctWhite) / 10) * 10) + (d.type === 'charter' ? 7 : 3) + d3.randomUniform(-1, 1)(),
     y: d => d.avgScore,
     fill: d => d.type === 'charter' ? '#ff4f00' : '#00b0ff',
     r: 3,
     title: d => `${d.name}\n${d.county}\nScore: ${(d.scoreSum/d.totalStudents).toFixed(2)}\nWhite: ${d.pctWhite.toFixed(1)}%`
   })
 ],
  color: {
    domain: ['Escola pública', 'Escola concertada'],
    range: ['#00b0ff', '#ff4f00'],
    legend: true,
    label: "Tipus d'escola"
  },
})
```

</div>