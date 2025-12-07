export function renderAreaGraph(band, genreData) {
  // 0) Container selection
  const container = document.querySelector("#areaGraph");
  container.innerHTML =""

  // -------------------------------
  // 1) Layout variables
  // -------------------------------
  const svgWidth = container.clientWidth;
  const svgHeight = container.clientHeight;

  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };

  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // -------------------------------
  // 2) Data
  // -------------------------------

  // -------------------------------
  // 3) Create SVG inside the container
  // -------------------------------
  const containerSelection = d3.select("#areaGraph");

  const svgSelection = containerSelection
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const chartGroup = svgSelection
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // -------------------------------
  // 4) Scales
  // -------------------------------
  // Flatten all year/fan points from all genres
  const allPoints = genreData.flatMap((g) => g.fansByYear);

  // X scale
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(allPoints, (d) => d.year))
    .range([0, innerWidth]);

  // Y scale
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(allPoints, (d) => d.fans)])
    .range([innerHeight, 0]);

  // -------------------------------
  // 5) Area generator
  // -------------------------------
  const areaGenerator = d3
    .area()
    .x((dataPoint) => xScale(dataPoint.year))
    .y0(innerHeight) // bottom of the area
    .y1((dataPoint) => yScale(dataPoint.fans));

  // -------------------------------
  // 6) Draw the area
  // -------------------------------

  //Filter genres by selectedBand

  const filteredGenres = genreData.filter((genre) =>
    band.style.includes(genre.id)
  );

  filteredGenres.forEach((genre, i) => {
    chartGroup
      .append("path")
      .datum(genre.fansByYear)
      .attr("class", "area")
      .attr("d", areaGenerator)
      .attr("fill", "#ddd")
      .attr("opacity", 0.3);

  });
}
