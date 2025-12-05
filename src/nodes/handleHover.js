export function handleHover(bandCircles) {
  bandCircles.on("mouseover", function (event, d) {
    d.isPaused = true;
    if (d.state === "orbiting") {
      d.originalAngularVelocity = d.angularVelocity;
      d.angularVelocity = 0;
    }
  });

  bandCircles.on("mouseleave", function (event, d) {
    d.isPaused = false;
    if (d.state === "orbiting") {
      d.angularVelocity = d.originalAngularVelocity;
    }
  });
}
