export function createNodes(data, zoomGroup, type) {
  //type must be "band"||"genre"
  data = type === "band" ? data : data;

  const circles = zoomGroup
      .selectAll(`${type}-group`)
      .data(data)
      .enter()
      .append("g")
      .attr("class", `${type}-group`);

    circles
      .append("circle")
      .attr("class", `${type}-circle`)
      .attr("r", (d) => d.radius)
      .attr("fill", type === "genre" ? "#ccc" : "orange")
      .attr("opacity", type === "genre" ? 1 : 0.7)
      .style("cursor", "pointer");

    circles
      .append("text")
      .attr("class", `${type}-text`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", type==="genre" ? (d) => d.radius / 6 + 1 : (d) => d.radius / 1.5)
      .attr("fill", type==="genre" ? "#000" : "#FFFFFF")
      .attr("pointer-events", "none")
      .text((d) => d.id) //quando mudar as estruturas, mudar isto para d.id para funcionar com os dois
      .attr("dy", type==="genre" ? 0 : (d) => d.radius)
      .attr("opacity", 1);

    return circles;
}


