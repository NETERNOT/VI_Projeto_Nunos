const fs = require("fs");
const Papa = require("papaparse");

const csvRaw = fs.readFileSync("public/db/metal_bands_2017_v2.csv", "utf8");

const { data: csvData } = Papa.parse(csvRaw, {
  header: true,
  dynamicTyping: true,
});

module.exports = csvData;
// console.log(csvData)
