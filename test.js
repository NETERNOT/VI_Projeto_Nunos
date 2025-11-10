import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const db = await d3.csv("assets/db/metal_bands_2017_v2.csv", d3.autoType);

console.log(db);
