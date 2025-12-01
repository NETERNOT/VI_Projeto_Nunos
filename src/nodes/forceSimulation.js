export function forceSimulation(data, nodes, strength, width, height){
    const simulation = d3
      .forceSimulation(data)
      .force("charge", d3.forceManyBody().strength(strength))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.radius + 5)
      )
      .force(
        "center",
        d3.forceCenter(width / 2, height / 2)
      );

    //update positions on each tick
    simulation.on("tick", () => {
      nodes.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });
}