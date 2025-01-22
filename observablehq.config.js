// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Visualització de Dades",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "PAC2",
      pages: [
        {name: "Scatterplot", path: "/scatterplot"},
        {name: "Sunburst", path: "/sunburst"},
        {name: "Ridgeline", path: "/ridgeline"},
      ]
    },
    {
      name: "PAC3: OptiReserve GTM",
      pages: [
        {name: "Escenari", path: "/hotels-escenari"},
        {name: "Durada de l'estada", path: "/hotels-durada"},
        {name: "Volum d'arribades", path: "/hotels-arribades"},
        {name: "Tarifa mitjana diària", path: "/hotels-tarifes"},
        {name: "Reserves fallides", path: "/hotels-fallides"},
      ]
    },
    {
      name: "Pràctica: PSSA 2024",
      pages: [
        {name: "Escoles concertades", path: "/pssa-escoles-concertades"},
        {name: "Notes mitjanes", path: "/pssa-notes-mitjanes"},
        {name: "Comtats i extracció racial", path: "/pssa-comtats-racial"},
      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: "Fet amb Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  toc: false, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  typographer: true, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
