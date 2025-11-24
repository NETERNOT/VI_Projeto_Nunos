export async function loadCsvData() {
  const response = await fetch("public/db/metal_bands_2017_v2.csv");
  const csvText = await response.text();

  const { data } = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
  });

  const limit = 100;
  const limitedData = data.slice(0, limit);

  console.log("CSV loaded in browser:", limitedData.length, "records");
  return limitedData;
}
