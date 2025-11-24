// CommonJS module for Node.js data processing
const fs = require("fs");
const Papa = require("papaparse");

// Load and parse CSV data
function loadCsvData() {
  const csvRaw = fs.readFileSync("assets/db/metal_bands_2017_v2.csv", "utf8");
  
  const { data } = Papa.parse(csvRaw, {
    header: true,
    dynamicTyping: true,
  });

  const limit = 100;
  const limitedData = data.slice(0, limit);
  
  console.log("CSV processed:", limitedData.length, "records");
  return limitedData;
}

// Export the function and data
const csvData = loadCsvData();
module.exports = {
  csvData,
  loadCsvData
};
