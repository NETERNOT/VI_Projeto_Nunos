export function renderAreaGraph(band, genreData) {
  //Filter genres by selectedBand
  const filteredGenres = genreData
    .filter((genre) => band.style.includes(genre.id))
    .sort((a, b) => b.fans.total - a.fans.total);

  console.log("A banda", band);
  const bandLineData = [
    { year: band.formed, fans: band.fans },
    { year: band.split === "-" ? 2016 : band.split, fans: band.fans },
  ];

  // 0) Container selection
  const container = document.querySelector("#areaGraph");
  container.innerHTML = "";

  const tooltip = d3
    .select("#areaLabel")
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
  // Layout
  // -------------------------------
  const svgWidth = container.clientWidth - 32;
  const svgHeight = container.clientHeight - 32;

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // -------------------------------
  // SVG
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
  // Line markers
  // -------------------------------
  const defs = svgSelection.append("defs");

  defs
    .append("marker")
    .attr("id", "circle-marker")
    .attr("markerWidth", 2)
    .attr("markerHeight", 2)
    .attr("refX", 1)
    .attr("refY", 1)
    .append("circle")
    .attr("cx", 1)
    .attr("cy", 1)
    .attr("r", 1)
    .attr("fill", "#ddd");

  defs
    .append("marker")
    .attr("id", "arrow-end")
    .attr("markerWidth", 5)
    .attr("markerHeight", 3.5)
    .attr("refX", 2)
    .attr("refY", 1.75)
    .attr("orient", "auto")
    .attr("markerUnits", "strokeWidth") // <-- important
    .append("path")
    .attr("d", "M0,0 L5,1.75 L0,3.5 Z")
    .attr("fill", "#ddd");

  // -------------------------------
  // Scales
  // -------------------------------
  const allPoints = filteredGenres.flatMap((g) => g.fansByYear);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(allPoints, (d) => d.year))
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(allPoints, (d) => d.fans)])
    .range([innerHeight, 0]);

  // -------------------------------
  // Generators
  // -------------------------------
  const areaGenerator = d3
    .area()
    .x((d) => xScale(d.year))
    .y0(innerHeight)
    .y1((d) => yScale(d.fans))
    .curve(d3.curveMonotoneX);

  const bandLineGenerator = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.fans));

  // -------------------------------
  // Areas
  // -------------------------------
  filteredGenres.forEach((genre) => {
    chartGroup
      .append("path")
      .datum(genre.fansByYear)
      .attr("class", "area")
      .attr("d", areaGenerator)
      .attr("fill", "#ddd")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .on("mouseover", () => {
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
  // Band line
  // -------------------------------
  chartGroup
    .append("path")
    .datum(bandLineData)
    .attr("class", "band-line")
    .attr("d", bandLineGenerator)
    .attr("fill", "none")
    .attr("stroke", "#ddd")
    .attr("marker-start", "url(#circle-marker)")
    .attr("stroke-width", 3)
    .attr(
      "marker-end",
      band.split === "-" ? "url(#arrow-end)" : "url(#circle-marker)"
    )
    .on("mouseover", () => {
      tooltip.transition().duration(100).style("opacity", 1);
      tooltip.html(`<strong class="timeline-genre-id">${band.id}</strong>`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 25 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // -------------------------------
  // Axes
  // -------------------------------
  const xAxisGenerator = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxisGenerator = d3.axisLeft(yScale).tickFormat((d) => `${d}K`);

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

  chartGroup
    .append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 12)
    .attr("text-anchor", "middle")
    .attr("fill", "#ddd")
    .text("Fans");

  chartGroup.selectAll(".x-axis path, .x-axis line").attr("stroke", "#ddd");
  chartGroup.selectAll(".y-axis path, .y-axis line").attr("stroke", "#ddd");
  chartGroup.selectAll(".x-axis text, .y-axis text").attr("fill", "#ddd");
}
