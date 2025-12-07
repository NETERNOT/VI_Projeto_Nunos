export function renderAreaGraph(band, genreData) {
    //Filter genres by selectedBand

  const filteredGenres = genreData.filter((genre) =>
    band.style.includes(genre.id)
  ).sort((a,b) => b.fans.total - a.fans.total);

  // 0) Container selection
  const container = document.querySelector("#areaGraph");
  container.innerHTML = "";

  const tooltip = d3
    .select("#areaLabel") // or a specific container
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "5px 10px")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // -------------------------------
  // 1) Layout variables
  // -------------------------------
  const svgWidth = container.clientWidth - 32;
  const svgHeight = container.clientHeight - 32;

  const margin = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
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
  const allPoints = filteredGenres.flatMap((g) => g.fansByYear);

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
    .y1((dataPoint) => yScale(dataPoint.fans))
    .curve(d3.curveMonotoneX);
  // -------------------------------
  // 6) Draw the area
  // -------------------------------


  filteredGenres.forEach((genre, i) => {
    chartGroup
      .append("path")
      .datum(genre.fansByYear)
      .attr("class", "area")
      .attr("d", areaGenerator)
      .attr("fill", "#ddd")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .on("mouseover", (event) => {
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(`<strong class="timeline-genre-id">${genre.id}</strong>`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  });

  // -------------------------------
  // 7) Optional: Axes (simple, minimal)
  // -------------------------------
  const xAxisGenerator = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxisGenerator = d3.axisLeft(yScale).tickFormat(d => `${d}K`);

  chartGroup
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxisGenerator);

  chartGroup.append("g").attr("class", "y-axis").call(yAxisGenerator);

  chartGroup
  .append("text")
  .attr("class", "x-axis-label")
  .attr("x", innerWidth / 2)
  .attr("y", innerHeight + margin.bottom - 5)
  .attr("text-anchor", "middle")
  .attr("fill", "#ddd")
  .text("Year");

// Y axis label (Fans)
chartGroup
  .append("text")
  .attr("class", "y-axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerHeight / 2)
  .attr("y", -margin.left + 12)
  .attr("text-anchor", "middle")
  .attr("fill", "#ddd")
  .text("Fans");

  // X axis color
  chartGroup.selectAll(".x-axis path, .x-axis line").attr("stroke", "#ddd");

  // Y axis color
  chartGroup.selectAll(".y-axis path, .y-axis line").attr("stroke", "#ddd");

  // Tick labels
  chartGroup.selectAll(".x-axis text, .y-axis text").attr("fill", "#ddd");
}
