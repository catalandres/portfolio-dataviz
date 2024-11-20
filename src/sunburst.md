# Població europea per territoris 2023

L'_Instituto Nacional de Estadística_ (INE) publica anualment les dades de població per territoris. A nivell europeu, tant l'INE com les corresponents organitzacions dels altres països membres (així com candidats a l'adhesió) de la Unió Europea, contribueixen les seves dades a l'agència estadística de la Unió Europea, Eurostat, que vetlla per a què les dades siguin comparables i homogènies.

Fem servir un diagrama _sunburst_, que ens permet veure la jerarquia de les dades, mostrant els territoris més grans prop del centre i les parts que el conformen a l'exterior. Això permet veure la distribució de la població europea per territoris i com es distribueix la població entre els diferents territoris. Aquest diagrama, a més, ens permet fer _zoom_, de forma que si fem clic a un punt de dades que es pugui descomposar en més detall, podrem posar aquesta descomposició al centre del diagrama.

Per a fer _zoom out_ i pujar un nivell de detall, només cal fer clic al cercle central del diagrama.

## Visualització

```js
const data = FileAttachment("data/territories.json").json();
```

<div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
<div id="dataviz_area" width=100%></div>
${
    resize(
        (width) => {
            plot(width);
        }
    )
}
</div>

```js
function plot(width) {
    var div = d3.select("#dataviz_area")

    const height = width;
    const radius = width / 6;

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    const hierarchy = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
    const root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
    root.each(d => d.current = d);

    const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

    const svg = d3.create("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, width])
            .style("font", "10px sans-serif");

  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

      .attr("d", d => arc(d.current));

    path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

    const format = d3.format(",d");
    path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(" : ")}\n${format(d.value)}`);

    const label = svg.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

    const parent = svg.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

    div.append(() => svg.node());

  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);

    path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }
  
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
}
```

## Dades visualitzades

```js
JSON.stringify(data, null, 2)
```

## Conjunt de dades

### Model

Per a poder projectar aquestes dades al _sunburst_, cal construir un arbre de territoris, on cada territori té un nom (per exemple, "Catalunya"), un codi (per exemple, "ES51"), i un valor que, en aquest cas, es tracta de la població estimada l'any 2023 (per exemple, 7 901 963). Cada node pot tenir fills, que són els territoris que el conformen. Per a poder implementar aquesta jerarquia, hem definit unes classes a JavaScript que ens permeten construir aquest arbre de forma fàcil i convertir-lo en una estructura de dades en JSON. Podeu trobar el codi del model de dades a `data/Territory.js`.

### Eurostat

[Les dades de població per territoris d'Eurostat](https://ec.europa.eu/eurostat/databrowser/view/demo_r_d2jan/default/table?lang=en&category=demo.demopreg) abasten quatre nivells: (1) el continental, (2) el nacional, (3) el regional de primer ordre i (4) el regional de segon ordre. Per exemple, a Espanya les comunitats autònomes són entitats regionals de segor ordre, i les províncies no hi apareixen. Les comunitats autònomes s'agrupen en macro-regions, com la regió est d'Espanya, la més poblada, que inclou Catalunya, les Illes Balears i la Comunitat Valenciana.

La informació és accessible fent una crida a [l'API que Eurostat posa a disposició del públic](https://wikis.ec.europa.eu/display/EUROSTATHELP/API+-+Getting+started+with+statistics+API). En el nostre cas, la URL específica és la següent:

[`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_r_d2jan/`<br/>`?format=JSON`<br/>`&lang=en`<br/>`&freq=A`<br/>`&unit=NR`<br/>`&sex=T`<br/>`&age=TOTAL`<br/>`&time=2023`](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_r_d2jan/?format=JSON&lang=en&freq=A&unit=NR&sex=T&age=TOTAL&time=2023)

La primera part del _data loader_ especificat a `data/territories.json.js` connecta amb aquesta URL per recollir les dades en format JSON i creuar la informació als _arrays_ `value`, `geo.index` i `geo.label` per a poder construir l'arbre de territoris. Una part important de la solució suposa adonar-nos que els codis dels territoris d'un nivell inclouen els codis dels territoris del nivell superior.

### INE

L'INE publica les dades de població per territoris a [la taula TPX 61398 de la seva pàgina web](https://ine.es/jaxi/Tabla.htm?tpx=61398). Aquestes dades són més granulars que les d'Eurostat, ja que inclouen tots els municipis d'Espanya. Inspeccionant les [instruccions](https://ine.es/dyngs/DataLab/manual.html?cid=66) [relatives](https://ine.es/dyngs/DAB/index.htm?cid=1102) a l'API de l'INE, podem veure que podem obtenir les dades en format JSON (aquestes inclouen els anys 2021, 2022 i 2023) fent una crida a la següent URL:

[`https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/61398`<br/>`?tv=Sexo:ambossexos`](https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/61398?tv=Sexo:ambossexos)

El tram final del _data loader_ itera sobre aquesta llista de municipis i els afegeix a l'estructura de l'arbre. No obstant això, hi ha un problema: les dades de l'Eurostat acaben al nivell autonòmic, i aquestes dades sobre municipis es poden encardinar al nivell provincial (els primers dos dígits del codi del municipi es corresponen amb els dels codis postals de cada província). Per això, entre el final del procés de càrrega de dades d'Eurostat i el començament del procés de càrrega de dades de l'INE, afegim totes les províncies d'Espanya, cadascuna penjant de la seva corresponent comunitat autònoma. Les dades d'aquesta correspondència les trobem a `data/provincias.js`.

## Referències

- Eurostat: [Population by regions](https://ec.europa.eu/eurostat/databrowser/view/demo_r_d2jan/default/table?lang=en&category=demo.demopreg)
    - [Documentació API](https://wikis.ec.europa.eu/display/EUROSTATHELP/API+-+Getting+started+with+statistics+API)
- Instituto Nacional de Estadística: [Población por municipios](https://ine.es/jaxi/Tabla.htm?tpx=61398)
    - [Com generar URLs per cridar l'API](https://ine.es/dyngs/DataLab/manual.html?cid=66)
    - [Com obtenir dades fent servir l'API](https://ine.es/dyngs/DAB/index.htm?cid=1102)
- GitHub: [frontid/ComunidadesProvinciasPoblaciones](https://github.com/frontid/ComunidadesProvinciasPoblaciones)
    - [Dades de les províncies d'Espanya](https://github.com/frontid/ComunidadesProvinciasPoblaciones/blob/master/provincias.json): l'original ha estat modificat per a incloure el codi Eurostat de la comunitat autònoma a què pertany cada província.
- D3: [Exemple de _zoomable sunburst_](https://observablehq.com/@d3/zoomable-sunburst) que hem fet servir per a construir la visualització.
