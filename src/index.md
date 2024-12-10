---
toc: false
---

<div class="hero">
  <h1>Visualització de Dades</h1>
</div>

## En quant a aquest dossier

Us presentem un estudi de tres visualitzacions interactives de dades, produïdes per Andrés Catalán Cárdenas amb [Observable Framework](https://observablehq.com/framework/) i [D3](https://d3js.org/) per a l'assignatura Visualització de Dades dels màsters universitaris en Enginyeria Informàtica i Ciència de Dades de la Universitat Oberta de Catalunya.

## Visualitzacions

<div class="grid grid-cols-3">
  <div class="card">
    <a href="./scatterplot.html"><h2>Scatterplot</h2></a>
  </div>
  <div class="card">
    <a href="./sunburst.html"><h2>Sunburst</h2></a>
  </div>
  <div class="card">
    <a href="./ridgeline.html"><h2>Ridgeline</h2></a>
  </div>
</div>

## Narrativa

<div class="grid grid-cols-3">
  <div class="card">
    <a href="./hotels.html"><h2>Hotels` </h2></a>
  </div>
</div>

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
