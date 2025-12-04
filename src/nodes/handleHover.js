export function handleHover(bandCircles){

    bandCircles.on("mouseover", function (event, d) {
      if (d.state === "orbiting") {
        d.originalAngularVelocity = d.angularVelocity;
        d.angularVelocity = 0;
      } else if (d.state === "traveling") {
        d.isPaused = true;
      }
    });

    bandCircles.on("mouseleave", function (event, d) {
      if (d.state === "orbiting") {
        d.angularVelocity = d.originalAngularVelocity;
      } else if (d.state === "traveling") {
        d.isPaused = false;
      }
    });
}