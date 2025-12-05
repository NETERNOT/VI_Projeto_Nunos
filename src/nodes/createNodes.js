export function createNodes(data, zoomGroup, type, imageFiles) {
  //type must be "band"||"genre"
  data = type === "band" ? data : data;

  let imageArray = [];

  if (typeof imageFiles === "function") {
    imageArray = imageFiles(0);
    console.log("Loaded images:", imageArray);
  } else {
    console.log("imageFiles is not a function:", typeof imageFiles, imageFiles);
  }

  const circles = zoomGroup
    .selectAll(`${type}-group`)
    .data(data)
    .enter()
    .append("g")
    .attr("class", `${type}-group`);

  if (type !== "band") {
    circles
      .append("circle")
      .attr("class", `${type}-circle`)
      .attr("r", (d) => d.radius)
      .attr("fill", type === "genre" ? "#ccc" : "orange")
      .attr("opacity", type === "genre" ? 1 : 0.7)
      .style("cursor", "pointer");
  } else if (type === "band" && typeof imageFiles === "function") {
    const imageElements = circles
      .append("image")
      .attr("class", `${type}-circle`)
      .attr("width", (d) => (d.split === "-" ? d.radius * 3 : d.radius * 2))
      .attr("height", (d) => (d.split === "-" ? d.radius * 3 : d.radius * 2))
      .attr("x", (d) => -d.radius)
      .attr("y", (d) => -d.radius)
      .attr("href", (d) => {
        let imageSet;
        if (d.split === "-") {
          if (d.isPaused === true) {
            imageSet = imageFiles(2);
          } else {
            imageSet = imageFiles(4);
          }
        } else {
          if (d.isPaused === true) {
            imageSet = imageFiles(1);
          } else {
            imageSet = imageFiles(3);
          }
        }
        return imageSet[0];
      })
      .attr("opacity", 0.7)
      .style("cursor", "pointer");

    let currentFrame = 0;
    setInterval(() => {
      currentFrame = (currentFrame + 1) % 4;

      imageElements.attr("href", function (d) {
        let imageSet;
        if (d.split === "-") {
          if (d.isPaused === true) {
            imageSet = imageFiles(2);
          } else {
            imageSet = imageFiles(4);
          }
        } else {
          if (d.isPaused === true) {
            imageSet = imageFiles(1);
          } else {
            imageSet = imageFiles(3);
          }
        }
        return imageSet[currentFrame % imageSet.length];
      });
    }, 200);
  } else {
    circles
      .append("circle")
      .attr("class", `${type}-circle`)
      .attr("r", (d) => d.radius)
      .attr("fill", "orange")
      .attr("opacity", 0.7)
      .style("cursor", "pointer");
  }

  circles
    .append("text")
    .attr("class", `${type}-text`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr(
      "font-size",
      type === "genre" ? (d) => d.radius / 6 + 1 : (d) => d.radius / 1.5
    )
    .attr("fill", type === "genre" ? "#000" : "#FFFFFF")
    .attr("pointer-events", "none")
    .text((d) => d.id) //quando mudar as estruturas, mudar isto para d.id para funcionar com os dois
    .attr("dy", type === "genre" ? 0 : (d) => d.radius)
    .attr("opacity", 1);

  return circles;
}
